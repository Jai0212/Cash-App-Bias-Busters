from app.repositories.interfaces import FileRepository
import pandas as pd


class GetValuesUnderHeader:
    def __init__(self, file_repo: FileRepository):
        self.file_repo = file_repo

    def execute(self, header: str) -> list[str]:
        """Fetch unique values under the specified header."""
        try:
            self.file_repo.save_data_to_csv()
            
            # First, get the headers from the repository
            headers = self.file_repo.get_headers()
            
            if header not in headers:
                print(f"Header '{header}' does not exist in the dataset.")
                return []
            
            # Read the data from CSV (file_repo provides the file path)
            df = pd.read_csv(self.file_repo.file_path)
            
            # Get unique values for the specified header
            unique_values = df[header].unique()

            print(f"Unique values under '{header}':", unique_values.tolist())

            # If it's the "age" column, categorize the values into ranges
            if header == "age":
                result = set()
                for value in unique_values.tolist():
                    if value <= 26:
                        result.add("18-26")
                    elif value <= 35:
                        result.add("27-35")
                    elif value <= 44:
                        result.add("36-44")
                    elif value <= 53:
                        result.add("45-53")
                    elif value <= 62:
                        result.add("54-62")
                    elif value <= 71:
                        result.add("63-71")
                    else:
                        result.add("72-80")

                print(f"Age ranges: {list(result)}")
                return list(result)
            
            return unique_values.tolist()

        except Exception as e:
            print(f"Error in GetValuesUnderHeader use case: {e}")
            return []
        
        finally:
            self.file_repo.delete_csv_data()
