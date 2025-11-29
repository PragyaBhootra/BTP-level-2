from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')

# Department email mapping
DEPARTMENT_EMAILS = {
    'railway': os.getenv('RAILWAY_EMAIL', 'railway.complaints@indianrailways.gov.in'),
    'delhi_police': os.getenv('DELHI_POLICE_EMAIL', 'complaints@delhipolice.gov.in'),
    'income_tax': os.getenv('INCOME_TAX_EMAIL', 'complaints@incometax.gov.in'),
    'delhi_traffic': os.getenv('DELHI_TRAFFIC_EMAIL', 'traffic.complaints@delhipolice.gov.in'),
    'general': os.getenv('GENERAL_EMAIL', 'general@example.com')
}

# Store conversation history (in production, use a database)
conversations = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chatbot conversation"""
    try:
        data = request.json
        user_message = data.get('message', '')
        session_id = data.get('session_id', 'default')
        
        # Initialize conversation history for new sessions
        if session_id not in conversations:
            conversations[session_id] = {
                'messages': [],
                'complaint_data': {},
                'stage': 'initial'
            }
        
        # Add user message to history
        conversations[session_id]['messages'].append({
            'role': 'user',
            'content': user_message,
            'timestamp': datetime.now().isoformat()
        })
        
        # Create context-aware prompt
        prompt = create_complaint_prompt(conversations[session_id], user_message)
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        bot_response = response.text
        
        # Add bot response to history
        conversations[session_id]['messages'].append({
            'role': 'assistant',
            'content': bot_response,
            'timestamp': datetime.now().isoformat()
        })
        
        # Extract complaint information using AI
        extract_complaint_info_with_ai(conversations[session_id], user_message)
        
        return jsonify({
            'response': bot_response,
            'session_id': session_id,
            'complaint_data': conversations[session_id]['complaint_data']
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/classify-department', methods=['POST'])
def classify_department():
    """Classify complaint to appropriate department using Gemini"""
    try:
        data = request.json
        complaint_text = data.get('complaint', '')
        session_id = data.get('session_id', 'default')
        
        # Get full conversation context
        context = conversations.get(session_id, {})
        full_complaint = f"{complaint_text}\n\nAdditional context: {json.dumps(context.get('complaint_data', {}))}"
        
        # Classification prompt
        classification_prompt = f"""
        Based on the following complaint, classify it into one of these departments:
        - railway (train issues, railway stations, railway accidents, coach problems, railway booking, railway safety, railway staff, tracks, platforms)
        - delhi_police (crime, theft, law and order, police complaints, FIR, harassment, missing persons, police misconduct)
        - income_tax (tax issues, tax refunds, tax fraud, PAN card, income tax returns, tax notices, tax assessment)
        - delhi_traffic (traffic violations, traffic signals, traffic accidents, road safety, parking issues, traffic police, challan, DL, RC)
        - general (other issues not fitting above categories)
        
        Complaint: {full_complaint}
        
        Respond with ONLY the department name (lowercase, use underscore for multi-word).
        """
        
        response = model.generate_content(classification_prompt)
        department = response.text.strip().lower()
        
        # Validate department
        if department not in DEPARTMENT_EMAILS:
            department = 'general'
        
        return jsonify({
            'department': department,
            'department_email': DEPARTMENT_EMAILS[department]
        })
        
    except Exception as e:
        print(f"Error in classify endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/send-email', methods=['POST'])
def send_email():
    """Send complaint email to classified department with attachments"""
    try:
        # Handle both JSON and form-data
        if request.content_type and 'multipart/form-data' in request.content_type:
            department = request.form.get('department', 'general')
            complaint_data = json.loads(request.form.get('complaint_data', '{}'))
            user_email = request.form.get('user_email', '')
            session_id = request.form.get('session_id', 'default')
            attachments = request.files.getlist('attachments')
        else:
            data = request.json
            department = data.get('department', 'general')
            complaint_data = data.get('complaint_data', {})
            user_email = data.get('user_email', '')
            session_id = data.get('session_id', 'default')
            attachments = []
        
        # Get conversation context
        context = conversations.get(session_id, {})
        
        # Generate AI summary and advice
        summary_and_advice = generate_complaint_summary_and_advice(context, department)
        
        # Generate user-friendly advice
        user_advice = generate_user_advice(context, department)
        
        # Compose email
        subject = f"New Complaint - {department.replace('_', ' ').title()} - Priority Review"
        body = format_email_body(complaint_data, context, user_email, summary_and_advice, department)
        
        # Send email with attachments
        success = send_smtp_email(
            to_email=DEPARTMENT_EMAILS[department],
            subject=subject,
            body=body,
            cc_email=user_email,
            attachments=attachments
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Email sent successfully',
                'department': department,
                'advice': user_advice
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to send email'
            }), 500
            
    except Exception as e:
        print(f"Error in send-email endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

def create_complaint_prompt(conversation, user_message):
    """Create a context-aware prompt for the chatbot"""
    stage = conversation.get('stage', 'initial')
    complaint_data = conversation.get('complaint_data', {})
    messages = conversation.get('messages', [])
    
    # Check what information we already have
    has_description = 'description' in complaint_data
    has_location = 'location' in complaint_data
    has_time = 'time' in complaint_data
    has_contact = 'contact' in complaint_data
    
    base_prompt = f"""
You are a professional complaint management assistant. Be concise, empathetic, and avoid repetitive questions.

ALREADY COLLECTED INFORMATION:
{json.dumps(complaint_data, indent=2)}

CONVERSATION SO FAR: {len(messages)} messages exchanged

RULES:
1. Ask ONLY ONE question at a time
2. NEVER repeat questions about information already collected
3. If the user provides multiple details, acknowledge them and ask for the next missing piece
4. Be brief - keep responses under 2 sentences
5. Essential information needed (in order):
   - Complaint description (what happened)
   - Location (specific place/area)
   - Date/Time (when it occurred)
   - Contact phone (if they want a callback)

User's latest message: {user_message}

YOUR TASK:
- If this is the first message and they're describing the issue, acknowledge it and ask for location
- If they give location, ask for when it happened
- If they give time, ask if they want to provide a contact number for follow-up
- Once you have description, location, and time, tell them: "Thank you! I have all the essential details. Click 'Send Email' to submit your complaint."
- Be natural and conversational, but precise
"""
    
    return base_prompt

def extract_complaint_info_with_ai(conversation, user_message):
    """Use AI to intelligently extract complaint information from the entire conversation"""
    try:
        messages = conversation.get('messages', [])
        complaint_data = conversation.get('complaint_data', {})
        
        # Get all user messages so far
        all_user_messages = "\n".join([
            msg['content'] for msg in messages if msg['role'] == 'user'
        ])
        
        # Use Gemini to extract structured information
        extraction_prompt = f"""
Analyze this conversation and extract the following information in JSON format:

USER MESSAGES:
{all_user_messages}

Extract and return ONLY a JSON object with these fields (if mentioned):
{{
  "description": "Brief description of what happened",
  "location": "Specific location/place (e.g., JNU Nagar, Rajiv Chowk Metro, Sector 15)",
  "time": "When it happened (e.g., 4:00 PM, yesterday, last week)",
  "contact": "Phone number if provided (10 digit number)"
}}

RULES:
1. Extract location even if it's part of a sentence (e.g., "theft at JNU nagar" -> location: "JNU Nagar")
2. Extract time even if embedded (e.g., "happened at 4:00 pm" -> time: "4:00 PM")
3. Only include fields that are actually mentioned
4. Return valid JSON only, no other text
5. If a field is not mentioned, omit it from JSON

Return the JSON:
"""
        
        response = model.generate_content(extraction_prompt)
        extracted_text = response.text.strip()
        
        # Clean up the response to get valid JSON
        if '```json' in extracted_text:
            extracted_text = extracted_text.split('```json')[1].split('```')[0].strip()
        elif '```' in extracted_text:
            extracted_text = extracted_text.split('```')[1].split('```')[0].strip()
        
        # Parse the JSON
        try:
            extracted_data = json.loads(extracted_text)
            
            # Update complaint data with extracted information
            for key, value in extracted_data.items():
                if value and value.strip():  # Only update if value is not empty
                    complaint_data[key] = value
            
            conversation['complaint_data'] = complaint_data
            
        except json.JSONDecodeError as je:
            print(f"JSON parse error: {je}")
            print(f"Extracted text: {extracted_text}")
            # Fallback to old method if AI extraction fails
            extract_complaint_info_fallback(conversation, user_message)
            
    except Exception as e:
        print(f"AI extraction error: {str(e)}")
        # Fallback to old method if AI extraction fails
        extract_complaint_info_fallback(conversation, user_message)

def extract_complaint_info_fallback(conversation, user_message):
    """Fallback extraction method using keyword detection"""
    complaint_data = conversation.get('complaint_data', {})
    message_lower = user_message.lower()
    messages = conversation.get('messages', [])
    
    # First user message is usually the description
    if len(messages) <= 2 and 'description' not in complaint_data:
        complaint_data['description'] = user_message
        conversation['complaint_data'] = complaint_data
        return
    
    # Smart location detection
    location_indicators = [
        'at ', 'in ', 'near ', 'location', 'address', 'street', 'road', 
        'area', 'station', 'stop', 'sector', 'block', 'metro', 'railway',
        'chowk', 'nagar', 'colony', 'phase', 'gate'
    ]
    if 'location' not in complaint_data:
        if any(indicator in message_lower for indicator in location_indicators):
            complaint_data['location'] = user_message
    
    # Smart time detection
    time_indicators = [
        'today', 'yesterday', 'last', 'ago', 'since', 'when', 
        'time', 'date', 'morning', 'evening', 'night', 'afternoon',
        'am', 'pm', 'o\'clock', 'hour', 'minute', 'day', 'week', 'month'
    ]
    if 'time' not in complaint_data:
        if any(indicator in message_lower for indicator in time_indicators):
            complaint_data['time'] = user_message
    
    # Smart contact detection
    contact_indicators = ['phone', 'mobile', 'number', 'contact', 'call', 'reach']
    # Check if message contains digits (likely a phone number)
    if 'contact' not in complaint_data:
        if any(indicator in message_lower for indicator in contact_indicators) or any(char.isdigit() for char in user_message):
            if len([char for char in user_message if char.isdigit()]) >= 10:  # Likely a phone number
                complaint_data['contact'] = user_message
    
    conversation['complaint_data'] = complaint_data

def generate_user_advice(context, department):
    """Generate user-friendly advice for the complainant"""
    try:
        messages = context.get('messages', [])
        complaint_data = context.get('complaint_data', {})
        
        conversation_text = "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in messages
        ])
        
        advice_prompt = f"""
Based on this complaint to the {department.replace('_', ' ').title()} department, provide helpful advice for the complainant.

COMPLAINT DATA:
{json.dumps(complaint_data, indent=2)}

Provide:
1. What the user should expect next (response time, process)
2. Any additional steps they should take
3. Documents or evidence they should preserve
4. Their rights in this situation

Keep it concise (3-5 bullet points), empathetic, and actionable.
"""
        
        response = model.generate_content(advice_prompt)
        return response.text
        
    except Exception as e:
        print(f"Error generating user advice: {str(e)}")
        return "Your complaint has been submitted. The department will review and contact you soon."

def generate_complaint_summary_and_advice(context, department):
    """Generate AI-powered summary and actionable advice for the department"""
    try:
        messages = context.get('messages', [])
        complaint_data = context.get('complaint_data', {})
        
        # Create conversation text
        conversation_text = "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in messages
        ])
        
        # Generate summary and advice using Gemini
        summary_prompt = f"""
Based on this complaint conversation, provide:

1. BRIEF SUMMARY (2-3 sentences max): Summarize the core issue
2. KEY DETAILS: Extract the most important facts
3. RECOMMENDED ACTION: Suggest specific steps the {department.replace('_', ' ').title()} department should take
4. PRIORITY LEVEL: Assess urgency (Low/Medium/High/Critical)

COMPLAINT DATA:
{json.dumps(complaint_data, indent=2)}

CONVERSATION:
{conversation_text}

Format your response clearly with these exact headings.
"""
        
        response = model.generate_content(summary_prompt)
        return response.text
        
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return "Unable to generate AI summary. Please review the complaint details below."

def format_email_body(complaint_data, context, user_email, summary_and_advice, department):
    """Format the email body with complaint details, summary, and AI advice"""
    
    # Extract key information
    description = complaint_data.get('description', 'Not provided')
    location = complaint_data.get('location', 'Not provided')
    time = complaint_data.get('time', 'Not provided')
    contact = complaint_data.get('contact', 'Not provided')
    
    email_body = f"""
╔══════════════════════════════════════════════════════════════════╗
║          NEW COMPLAINT - {department.replace('_', ' ').upper()}          ║
╚══════════════════════════════════════════════════════════════════╝

📅 Submitted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
👤 Complainant: {user_email}
📧 Contact: {contact}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI-GENERATED ANALYSIS & RECOMMENDATIONS:

{summary_and_advice}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COMPLAINT DETAILS:

🔸 What Happened:
   {description}

🔸 Location:
   {location}

🔸 When:
   {time}

🔸 Contact Information:
   {contact}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANT:
This complaint has been automatically classified and routed to your department.
Please review and take appropriate action within the standard response timeframe.

A copy of this complaint has been sent to: {user_email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by AI-Powered Complaint Management System
"""
    
    return email_body

def send_smtp_email(to_email, subject, body, cc_email=None, attachments=None):
    """Send email using SMTP with optional attachments"""
    try:
        sender_email = os.getenv('GMAIL_USER')
        sender_password = os.getenv('GMAIL_APP_PASSWORD')
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        
        # Create message
        message = MIMEMultipart()
        message['From'] = sender_email
        message['To'] = to_email
        message['Subject'] = subject
        
        if cc_email:
            message['Cc'] = cc_email
        
        message.attach(MIMEText(body, 'plain'))
        
        # Attach files if provided
        if attachments:
            for file in attachments:
                try:
                    # Read file data
                    file_data = file.read()
                    file.seek(0)  # Reset file pointer
                    
                    # Create attachment
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(file_data)
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {file.filename}'
                    )
                    message.attach(part)
                    print(f"Attached file: {file.filename}")
                except Exception as e:
                    print(f"Error attaching file {file.filename}: {str(e)}")
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            
            recipients = [to_email]
            if cc_email:
                recipients.append(cc_email)
            
            server.send_message(message)
        
        print(f"Email sent successfully to {to_email}")
        if attachments:
            print(f"With {len(attachments)} attachment(s)")
        return True
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

if __name__ == '__main__':
    app.run(debug=True, port=5000)
