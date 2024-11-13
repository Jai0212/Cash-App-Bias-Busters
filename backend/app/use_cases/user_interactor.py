from app.repositories.user_repository import UserRepository

def register_user_interactor(firstname, lastname, email, password):
    user_repo = UserRepository(table_name='users')  # Pass the required 'table_name' argument
    existing_user = user_repo.get_user_by_email(email)
    if existing_user:
        raise ValueError("Email already exists")

    user_repo.create_user(firstname, lastname, email, password)
    return {"message": "User registered successfully"}

def login_user_interactor(email, password):
    user_repo = UserRepository(table_name='users')  # Pass the required 'table_name' argument
    user = user_repo.get_user_by_email_and_password(email, password)
    if not user:
        raise ValueError("Invalid credentials")
    return {"message": "Login successful"}


def change_password_interactor(email, old_password, new_password):
    user_repo = UserRepository(table_name='users')  # Pass the required 'table_name' argument
    user = user_repo.get_user_by_email_and_password(email, old_password)

    if not user:
        raise ValueError("Old password is incorrect or user does not exist")

    # Update the user's password
    user_repo.update_password(email, new_password)
    return {"message": "Password updated successfully"}