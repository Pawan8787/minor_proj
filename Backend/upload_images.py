import os
import firebase_admin
from firebase_admin import credentials, storage, firestore
# Reference to the Firebase Storage bucket


path_images = os.path.join(os.getcwd())
os.makedirs(f"{path_images}/images", exist_ok=True)

def upload_images(db,bucket):
    """
    The function upload_images uploads images from a local directory to Firebase Storage, and also
    adds corresponding data to a Firestore database.
    """
    m=0
    while True:
        images = None
        if(os.path.exists(os.path.join(path_images,'images'))):
            images = os.listdir(os.path.join(path_images,'images'))
        if images!=None:
            for path in images:
                loc = path.split('.')[0]
                loc = loc + '.txt'
                image_path = os.path.join(path_images,'images',path)
                # Local path to the image you want to upload
                local_location_path = os.path.join(path_images,'location',loc)
                with open(local_location_path,'r') as f:
                    location = f.readline()
                    longi, lati = location.split(" ")
                # Path in Firebase Storage where you want to store the image
                # upload location with image name as id
                firebase_storage_path = f"images/hole{m}.jpg"
                data = {"longi": longi, "lati": lati}
                db.collection("streamlocation").document(f"hole{m}.jpg").set(data)
                # Upload the image to Firebase Storage
                blob = bucket.blob(firebase_storage_path)
                blob.upload_from_filename(image_path)
                print(f"Image uploaded to Firebase Storage: {firebase_storage_path}")
                try:
                        os.remove(image_path)
                        print(f"Video removed successfully: {image_path}")
                except (FileNotFoundError, PermissionError, OSError) as e:  # Catch specific common errors
                        print(f"Error: {e}")
                except Exception as e:  # Catch all other unexpected errors
                        print(f"An unexpected error occurred: {e}")
                try:
                        os.remove(local_location_path)
                        print(f"Video removed successfully: {os.remove(local_location_path)}")
                except (FileNotFoundError, PermissionError, OSError) as e:  # Catch specific common errors
                        print(f"Error: {e}")
                except Exception as e:  # Catch all other unexpected errors
                        print(f"An unexpected error occurred: {e}")
                m+=1