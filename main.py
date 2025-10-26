from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import sqlite3
import os
import base64
from functools import wraps

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'  # Change this in production!

# Database setup
DATABASE = 'quizzy.db'

def get_db():
    """Connect to the database"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            grade TEXT,
            graduation_year TEXT,
            nationality TEXT,
            university TEXT,
            profile_image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database when app starts
init_db()

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def index():
    # Fetch user data including profile image from database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
    user = cursor.fetchone()
    conn.close()
    
    # Redirect to base.html which will load home content dynamically
    return render_template('base.html', user=user)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = request.form.get('remember')
        
        if not email or not password:
            flash('Please fill in all fields.', 'error')
            return render_template('login.html')
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if user and check_password_hash(user['password'], password):
            # Login successful
            session['user_id'] = user['id']
            session['user_name'] = f"{user['first_name']} {user['last_name']}"
            session['user_email'] = user['email']
            # Don't store profile_image in session - it's too large for cookies
            
            if remember:
                session.permanent = True
            
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid email or password.', 'error')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        terms = request.form.get('terms')
        
        # Validation
        if not all([first_name, last_name, email, password, confirm_password]):
            flash('Please fill in all fields.', 'error')
            return render_template('signup.html')
        
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('signup.html')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'error')
            return render_template('signup.html')
        
        if not terms:
            flash('Please agree to the Terms & Conditions.', 'error')
            return render_template('signup.html')
        
        # Hash password
        hashed_password = generate_password_hash(password)
        
        # Insert user into database
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO users (first_name, last_name, email, password)
                VALUES (?, ?, ?, ?)
            ''', (first_name, last_name, email, hashed_password))
            conn.commit()
            
            # Auto-login after signup
            user_id = cursor.lastrowid
            session['user_id'] = user_id
            session['user_name'] = f"{first_name} {last_name}"
            session['user_email'] = email
            
            flash('Account created successfully!', 'success')
            conn.close()
            return redirect(url_for('index'))
            
        except sqlite3.IntegrityError:
            flash('Email already exists. Please use a different email.', 'error')
            conn.close()
            return render_template('signup.html')
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'success')
    return redirect(url_for('login'))

# API endpoints for content loading
@app.route('/overview')
@login_required
def overview():
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render_template('overview.html')
    return render_template('base.html')

@app.route('/analysis')
@login_required
def analysis():
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render_template('analysis.html')
    return render_template('base.html')

@app.route('/createQuiz')
@login_required
def create_quiz():
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render_template('createQuiz.html')
    return render_template('base.html')

@app.route('/quizPage')
@login_required
def quiz_page():
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render_template('quizPage.html')
    return render_template('base.html')

@app.route('/home')
@login_required
def home_page():
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render_template('home.html')
    return render_template('base.html')

@app.route('/profile')
@login_required
def profile():
    # Get full user data from database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (session.get('user_id'),))
    user = cursor.fetchone()
    conn.close()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render_template('profile.html', user=user)
    return render_template('base.html')

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    try:
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        phone = request.form.get('phone')
        grade = request.form.get('grade')
        graduation_year = request.form.get('graduation_year')
        nationality = request.form.get('nationality')
        university = request.form.get('university')
        
        print(f"Received data: {first_name}, {last_name}, {phone}, {grade}, {graduation_year}, {nationality}, {university}")
        print(f"User ID: {session.get('user_id')}")
        
        # Validation
        if not first_name or not last_name:
            return jsonify({'success': False, 'message': 'First name and last name are required.'}), 400
        
        # Update database
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                UPDATE users 
                SET first_name = ?, last_name = ?, phone = ?, grade = ?, 
                    graduation_year = ?, nationality = ?, university = ?
                WHERE id = ?
            ''', (first_name, last_name, phone, grade, graduation_year, 
                  nationality, university, session.get('user_id')))
            conn.commit()
            
            print(f"Updated {cursor.rowcount} rows")
            
            # Update session with new name
            session['user_name'] = f"{first_name} {last_name}"
            
            return jsonify({'success': True, 'message': 'Profile updated successfully!'})
        except Exception as e:
            print(f"Database error: {str(e)}")
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        finally:
            conn.close()
    except Exception as e:
        print(f"General error: {str(e)}")
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@app.route('/upload_profile_image', methods=['POST'])
@login_required
def upload_profile_image():
    try:
        if 'profile_image' not in request.files:
            return jsonify({'success': False, 'message': 'No file uploaded'}), 400
        
        file = request.files['profile_image']
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
        
        # Read and encode image as base64
        image_data = file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
        
        # Create data URL
        mime_type = f"image/{file_extension}"
        if file_extension == 'svg':
            mime_type = "image/svg+xml"
        data_url = f"data:{mime_type};base64,{base64_image}"
        
        # Update database
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE users 
            SET profile_image = ? 
            WHERE id = ?
        ''', (image_data, session['user_id']))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'image_url': image_data})
    
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)