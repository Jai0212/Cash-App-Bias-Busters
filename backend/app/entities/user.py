class User:
    """
    A class used to represent a User.

    Attributes
    ----------
    user_email : int
        The email of the user (should be a string, but currently typed as int).

    Methods
    -------
    __init__(user_email: int)
        Initializes the User with the given email.
    """

    def __init__(self, user_email: int):
        self.table_name = user_email
