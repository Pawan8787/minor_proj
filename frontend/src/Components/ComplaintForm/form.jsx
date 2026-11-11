import React, { useState } from 'react';
import Navbar from '../Navbar/navbar';
import { imageDb } from '../../utilities/Firebase'
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
// import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import "./form.css";
import { addFormdata } from '../../utilities/Firebase'

// const MapComponent = withScriptjs(
//   withGoogleMap((props) => (
//     <GoogleMap defaultZoom={8} defaultCenter={{ lat: props.lat, lng: props.lng }}>
//       {props.isMarkerShown && <Marker position={{ lat: props.lat, lng: props.lng }} />}
//     </GoogleMap>
//   ))
// );

function ImageUploadForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [pothole, setpothole] = useState('');

  const [image, setImage] = useState(null);
  const [ImgUrl, setImgUrl] = useState('');
  // const [name, setName] = useState('');
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [showMap, setShowMap] = useState(false);


  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    
    setImage(selectedImage);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // You can add your image upload and form submission logic here.
   
      if(image !==null){
         const imgRef =  ref(imageDb,`files/${v4()}`)
         uploadBytes(imgRef,image).then(value=>{
             console.log(value)
             getDownloadURL(value.ref).then(url=>{
                 setImgUrl(url)
             })
         })
      }
     
    // Include the name, location.lat, and location.lng in the submission.
    
   
    addFormdata(name,email,phoneNumber,message,address,city,district,state,pincode,ImgUrl,pothole);
    // // Reset the form after submission
    // console.log("Name:", name);
    // console.log("Email:", email);
    // console.log("Phone Number:", phoneNumber);
    // console.log("Message:", message);

    // Reset the form after submission
    setName('');
    setEmail('');
    setPhoneNumber('');
    setMessage('');
    // Reset the form after submission
    setAddress('');
    setCity('');
    setDistrict('');
    setState('');
    setPincode('');
    setImgUrl('');
    setImage(null);
    setpothole('');
    // setImage(null);
    // setName('');
    // setLocation({ lat: 0, lng: 0 });
    // setShowMap(false);


    // // e.preventDefault();

    // // You can access the form data (address, city, district, state, and pincode)
    // // and perform your submission logic here.

    // // For this example, we'll just log the form data.
    // console.log("Address:", address);
    // console.log("City:", city);
    // console.log("District:", district);
    // console.log("State:", state);
    // console.log("Pincode:", pincode);

    console.log(ImgUrl);
     
    
  };
  // map.on('click', function (e) {
  //   setLocation(e.lngLat);
  // });
  
  return (
    <>
    
    <div className="form-container">
      {/* <br /> */}
      <h1>Upload details about potholes</h1>
      <br />
      <form onSubmit={handleSubmit}>
        <div className="form-details-pothole form-container-inner">
        <div className='form-container-details'>
          <label htmlFor="image">Choose an image:</label>
          <input
            className='form-image-input'
            type="file"
            id="image"
            accept=".jpg, .jpeg, .png"
            onChange={handleImageChange}
          />
        </div>
          <br />

        {image && (
          <div>
            <p>Selected Image:</p>
            <img src={URL.createObjectURL(image)} alt="Selected" width="200" />
          </div>
        )}
        <div>
          <label htmlFor="name">Number of pothole:</label>
          <input
            type="text"
            id="name"
            value={pothole}
            onChange={(e) => setpothole(e.target.value)}
          />
        </div>

<div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          </div>
          <div>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        </div>
<br /><br />
        <h1>Location</h1>
        <div className="form-container-inner">

        <div>
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="district">District:</label>
          <input
            type="text"
            id="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="state">State:</label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="pincode">Pincode:</label>
          <input
            type="text"
            id="pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
        </div>
        </div>

        {/* <div>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={`${location.lat}, ${location.lng}`}
            readOnly
          />
          <button
            type="button"
            onClick={() => setShowMap(true)}
          >
            Choose on Map
          </button>
        </div>

        {showMap && (
          <MapComponent
            isMarkerShown
            lat={location.lat}
            lng={location.lng}
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAMtbc4WU0CM-xz0iurLoefdXuVlSBABYQ"
            loadingElement={<div style={{ height: '100%' }} />}
            containerElement={<div style={{ height: '200px' }} />}
            mapElement={<div style={{ height: '100%' }} />}
          />
        )} */}
        <div className="button-capsule">
          <br />
        <button type="submit">Submit</button>
        </div>
      </form>
    </div>
    </>
  );
}

export default ImageUploadForm;
