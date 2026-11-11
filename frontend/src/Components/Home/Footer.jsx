import React from "react";
import '../Home/Home.css';

const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <div>
            <div className='footer'>
                <div className='footerContent footerContent-1'>
                    <h4>Made with ❤️ by Accio Devs</h4>
                    <h2>Team Members</h2>
                    <ul>
                        <a href="https://github.com/chirag-garg9" target="_blank"><li>Chirag Garg</li></a>
                        <a href="https://github.com/ayushshukla011" target="_blank"><li>Ayush Shukla</li></a>
                        <a href="https://github.com/harshpastor" target="_blank"><li>Harsh Pastor</li></a>
                        <a href="https://github.com/harsshukla" target="_blank"><li>Harsh Shukla</li></a>
                        <a href="https://github.com/praveen-p09" target="_blank"><li>Praveen Patro</li></a>
                    </ul>
                </div>
                <div className='footerContent footerContent-2'>
                    <h2>Nearest PWD office</h2>
                    <p>Contact:-  (+91) <a href="tel:07712512703">0771-2512703</a></p>
                        <p>Fax:-  (+91) <a href="tel:07712512729">0771-2512729</a></p>
                        <p>Email:- <a href="mail:einc.pwd.cg@gov.in">einc[dot]pwd[dot]cg[at]gov[dot]in</a></p>
                        <a href="https://www.google.co.in/maps/place/Nirman+Bhawan,+C.+G.+-+P.+W.+D.,+NEW+PWD+OFFICE/@21.169321,81.7906036,15z/data=!4m14!1m7!3m6!1s0x3a28c6babe8673e5:0xc35ffb08bcb75b86!2sNirman+Bhawan,+C.+G.+-+P.+W.+D.,+NEW+PWD+OFFICE!8m2!3d21.1673752!4d81.7908257!16s%2Fg%2F11f11p3ckn!3m5!1s0x3a28c6babe8673e5:0xc35ffb08bcb75b86!8m2!3d21.1673752!4d81.7908257!16s%2Fg%2F11f11p3ckn?hl=en&entry=ttu" target="_blank">
                <p>Address:- O/o EinC PWD, Nirman Bhawan,</p>
                        <p> North Block, Sec-19, Nava Raipur, Atal Nagar</p>
                        <p>Dist-Raipur, Chhattisgarh- 492002</p></a>
                </div>
                <div className='footerContent footerContent-3'>
                    <p>© {year} All Rights Reserved.</p>  
                </div>
            </div>
            
        </div>

    )

}

export default Footer;
