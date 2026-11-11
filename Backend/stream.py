import cv2
from ultralytics import YOLO
import torch
import os

def save_video_bytes(video_bytes, filename):
    with open(filename, 'wb') as f:  # Open file in binary write mode
        f.write(video_bytes)

class streaming():
    def __init__(self):
        # The code snippet initializes several instance variables for the `streaming` class. Here's a
        # breakdown of each variable:
        self.m = 0
        self.cap = None
        self.long = None
        self.lati = None
        self.path_video = os.path.join(os.getcwd(),"video")
        self.url = None
        self.video_data = None
        os.makedirs(self.path_video,exist_ok=True)
        
    def set_data(self,longi,lati,video_data=None,video_url=None):
        if(video_data is not None):
            self.video_data = video_data
            filename = os.path.join(os.getcwd(),'video/saved_video.mp4')  # Choose a desired filename
            save_video_bytes(video_data, filename)
            self.path_video = filename
            self.cap = cv2.VideoCapture(filename)
        elif(video_url is not None):
            self.cap = cv2.VideoCapture(video_url)
            print(video_url)
        self.long = longi
        self.lati = lati
        
    def generate_frames(self):
        """
        The function `generate_frames` captures frames from a video stream, performs object detection using
        YOLO model, and yields the processed frames as JPEG images.
        """
        # print(torch.cuda.is_available())
        model = YOLO('best.pt')
        m = 0
        is_saved = False
        cnt = 0
        while True:
            if(self.cap!=None):
                ret, frame = self.cap.read()
                if ret:
                    frame = cv2.resize(frame, (int(1920 / 1.38), int(1080 / 1.38)))
                    result = model.track(frame,persist=True)
                    for res in result:
                        boxes = res.boxes
                        for i, r in enumerate(boxes.xyxy):
                            r = r.cpu().tolist()
                            c = boxes.conf[i].tolist()
                            x1, y1, x2, y2 = r[0], r[1], r[2], r[3]
                            if (c >= 0.65):
                                if is_saved and cnt <= 10:
                                    cnt += 1
                                elif is_saved:
                                    is_saved = False
                                    cnt = 1
                                else:
                                    xmid = int(x1 + x2) // 2
                                    ymid = int(y1 + y2) // 2
                                    disx = (xmid - frame.shape[1] // 2) ** 2
                                    disy = (ymid - frame.shape[0] // 2) ** 2
                                    dis = disx + disy
                                    dis = dis ** 0.5

                                    if dis < 40 and not is_saved:
                                        cv2.imwrite(f"images/image{self.m}.jpg", frame[int(y1) - 20:int(y2) + 20, int(x1) - 20:int(x2) + 20])
                                        with open(f"image{self.m}.txt",'w') as f:
                                            f.write(f"{self.long} {self.lati}")
                                        is_saved = True
                                        self.m += 1
                                        
                                frame = cv2.line(frame, (frame.shape[1] // 2, frame.shape[0] // 2),
                                                (int(x1 + x2) // 2, int(y1 + y2) // 2), (255, 0, 255), 2)
                                font = cv2.FONT_HERSHEY_SIMPLEX
                                frame = cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                                frame = cv2.putText(frame, f'Pothole  {c:.2f}', (int(x1), int(y1) - 5), font, .75,
                                                    (0, 255, 255), 2)
                    # cv2.imshow('Phone Camera', frame)
                    # if cv2.waitKey(1) & 0xFF == ord('q'):
                    #     break
                    _, buffer = cv2.imencode('.jpg', frame)
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                else:
                    if(self.video_data is not None):
                        try:
                            os.remove(self.path_video)
                            print(f"Video removed successfully: {self.path_video}")
                        except (FileNotFoundError, PermissionError, OSError) as e:  # Catch specific common errors
                            print(f"Error: {e}")
                        except Exception as e:  # Catch all other unexpected errors
                            print(f"An unexpected error occurred: {e}")
                        self.video_data = None
                    self.cap.release()
                    self.cap = None
                    self.lati = None
                    self.long = None
            else:
                return "Failed"

