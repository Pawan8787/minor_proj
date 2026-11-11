import React, { useState, useEffect } from 'react'
import { addLocationtoDb, getCoordinate } from '../utilities/Firebase'

const Addlocation = () => {
    const [location, setlocation] = useState({ lati: " ", longi: " " })
    const [locfromdb, setlocfromdb] = useState([]);

    const change = (e) => {

        setlocation({ ...location, [e.target.name]: e.target.value })//triple dot indicates jo pahle se hai usko rahne do uske aage se sab aur add kar do
    }
    const handlesubmit = (e) => {
        e.preventDefault();
        addLocationtoDb(location.lati, location.longi);
        console.log(location);
    }
    useEffect(() => {
        const getloca = async () => {
            const data = await getCoordinate();
            setlocfromdb(data);
        }
        getloca();
    }, [])

    return (
        <div>
            <form className="my-3">
                <div className="mb-3">
                    <label htmlFor="lati" className="form-label">
                        lati
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="lati"
                        aria-describedby="emailHelp"
                        name="lati"
                        onChange={ change }
                    />

                </div>
                <div className="mb-3">
                    <label htmlFor="longi" className="form-label">
                        longi
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="longi"
                        name="longi"
                        onChange={ change }
                    />
                </div>


                <button type="submit" className="btn btn-primary" onClick={ handlesubmit }>
                    add location to db
                </button>
            </form>

            <div>
                displaying all latitude and longitude
                { locfromdb.map((location) => {
                    return (
                        <div>
                            <div>
                                latitude={ location.latitude };
                            </div>
                            <div>
                                longitude={ location.longitude };
                            </div>
                        </div>
                    )
                }) }
            </div>

            <div style={ { margin: '15px' } }>
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
               </div>
            

        </div>
    )
}

export default Addlocation