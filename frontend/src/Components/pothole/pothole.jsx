import React, { useEffect, useState } from 'react'
import { useParams,useNavigate } from "react-router-dom";
import {getCoordinate } from '../../utilities/Firebase'
// import Navbar from '../Navbar/navbar';
// import ProgressBar from 'react-bootstrap/ProgressBar';
import CommentCard from '../Comments/comments';
import { signInWithGoogleRedirect, signUserAccountOut } from "../../utilities/Firebase";
import './pothole.css';
const Pothole = () => {
  const postId = useParams();
  // console.log(postId)
  const [locfromdb, setlocfromdb] = useState([]);
const [holedetail, setholedetail] = useState();
  const [hole, sethole] = useState();

  const navigate=useNavigate();  

  

  useEffect(() => {
    const getloca = async () => {
        const data = await getCoordinate();
        setlocfromdb(data);
        const postInfo = data.filter((x) => x.id === postId.holeID)[0];
        console.log(postInfo);
        setholedetail(postInfo)
        console.log(holedetail)
        // console.log(data);
    }
    
    getloca();
   
    
}, [])
const handlesignout = async () => {
  await signUserAccountOut();
  localStorage.clear();
  navigate("/map");

}


const signInWithGoogle = async () => {
  const response = await signInWithGoogleRedirect();
  if (response) {
    localStorage.setItem("isAuth", true);

    console.log(localStorage.getItem("isAuth"));

    navigate(`/pothole/${postId}`);
  }

};
const signinhandle = () => {
  signInWithGoogle();
  // localStorage.setItem("isAuth");
};


  return (
    <>
      
      
      <div className="pothole">
    {!localStorage.getItem('isAuth')?<div> <button
            onClick={signinhandle}
            className="loginbtn"
          >
            Login
            
          </button></div>:<div> <button
            onClick={handlesignout}
            className="loginbtn"
          >
            signOut
            
          </button></div>}

        { holedetail && (

       
      <div className="container">
         <h1>Pothole -{holedetail.id}</h1>
         <div className='flexr'>
       {holedetail.id!=="spAn2mfSpf"? <div className='bg3d wrapper'>

          <img src="https://t3.ftcdn.net/jpg/03/60/90/92/360_F_360909266_3mWP6FZZOQMG5aRUozFYPKjPm6FK4nUx.jpg" alt="bg-scale" />
          <model-viewer id="reveal" loading="eager" src={'../../../model.glb'} alt="A 3D model of an item" camera-controls></model-viewer>
        </div>:  <div style={ { margin: '15px' } }>
            <div className="sketchfab-embed-wrapper">
      <iframe
        title="pothole3d"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src="https://sketchfab.com/models/b1e31f0088e54488ac6d8040075e0e78/embed?autostart=1&preload=1&ui_theme=dark"
        width="400"
        height="400" // Set the desired height
      ></iframe>
    </div>
               </div>}
        <div  className="details">
          <h3>Details</h3>
          <p>Coordinates : {holedetail.longitude}, {holedetail.latitude}</p>
          <p>Area:{holedetail.area} m square</p>
          <p>Volume :{holedetail.volume} m cube</p>
          <p>Severity :High</p>
          <p>Material : Asphalt concrete</p>
          <p>Suggestion : </p>
          <ul>
            <li><p>Sealing</p></li>
            <li><p>Overlays</p></li>
            <li><p>Reconstruction</p></li>
            <li><p>Patching</p></li>
          </ul>
          
        </div>
        </div>
      </div>)}
      </div>
      <h1>Comments by Experts</h1>
      <CommentCard/>
      
      {/* <ProgressBar animated now={60}  label={`{60}%`}/>
      
        <p><img src={require("../../assets/green_checkmark.svg").default} alt="tick" /> Form submitted and Drone review</p>
        <p><img src={require("../../assets/green_checkmark.svg").default} alt="tick" /> Sent to Chief Engineer, PWD</p>
        <p><img src={require("../../assets/green_checkmark.svg").default} alt="tick" /> Material and budget sanctioned, assigned to job Engineer</p>
        <p><img src={require("../../assets/pending.svg").default} alt="pending" /> Road maintenance contractor tender passed</p>
        <p><img src={require("../../assets/pending.svg").default} alt="pending" /> Job executed (Delete record)</p>
       */}
      
    </>
  )
}

export default Pothole