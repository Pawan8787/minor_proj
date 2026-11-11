import complaintImg from '../../assets/Images/complaint.svg';
import pothole_details from '../../assets/Images/pothole_details.jpeg';
import detection from '../../assets/Images/detection.jpeg';
import map from '../../assets/Images/map-img.png';
import workingVideo from '../../assets/Videos/working.mp4';
import './working.css';
const Working=()=>{
    return(
    <>
    <div className="working">
            <h1>Components & Working</h1>
            <div class="timeline">
  <div class="containerTimeLine left">
    <div class="content">
            
              <h3>Working</h3>
            <iframe src="https://drive.google.com/file/d/1SFf3H3sZCRZFv1cPCZFbZNX96STXmczS/preview" width="480" height="360" allow="autoplay">Your browser does not support the video tag.</iframe>
            
    </div>
  </div>
  <div class="containerTimeLine right">
    <div class="content">
    <div ><h3>Map</h3><p>Moving from point A to point B?<br /> To make your journey seamless and safe, We made it easier for you to locate potholes, Just mark your starting point and ending point and we'll show you where the potholes are in your journey.</p></div>
    <img   src={map} className="workingImg" alt="" />
    </div>
  </div>
<div class="containerTimeLine left">
    <div class="content">
            
              <h3>Working</h3>
              <img src={detection} alt="" className='workingImg'/>            
    </div>
  </div>
  <div class="containerTimeLine right">
    <div class="content">
    <div ><h3>3D model of pothole</h3><p>Experts gets a 3D model of the pothole to look and comment on the pothole.</p></div>
    <img src={pothole_details} className='workingImg' alt="" />
    </div>
  </div>  
  
    </div>
    </div>
    </>
    )
}
export default Working;