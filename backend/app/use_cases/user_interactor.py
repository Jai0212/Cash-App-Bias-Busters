from repositories.user_repository import UserRepository

def register_user_interactor(firstname, lastname, email, password):
    existing_user = UserRepository.get_user_by_email(email)
    if existing_user:
        raise ValueError("Email already exists")

    UserRepository.create_user(firstname, lastname, email, password)
    return {"message": "User registered successfully"}

def login_user_interactor(email, password):
    user = UserRepository.get_user_by_email_and_password(email, password)
    if not user:
        raise ValueError("Invalid credentials")
    return {"message": "Login successful"}