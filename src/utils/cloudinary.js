// import { v2 as cloudinary } from 'cloudinary';
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'

          
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET 
// });
          
cloudinary.config({ 
  cloud_name: 'dazmqutip', 
  api_key: '126285411787831', 
  api_secret: 'pDYUXAhsOecfAv6Urc11cDN_1rI' 
});


const uploadOnCloudinary = async (localFilePath) => {
    try{
      // console.log("Successfully Entered try block...")
      if(!localFilePath){ 
        console.log("File Local Path Not Found...")
        return null;} // means file path was not found here localFilePath written beacuse file is temprorily stored on local server

 // upload file on cloudinary
// console.log("Means File Path Found...")
const response = await cloudinary.uploader.upload
  (localFilePath, {
    // means providing file url and other options(optional)
    resource_type: 'auto'
 }) 

// const response = cloudinary.uploader.upload(localFilePath,
//   // { public_id: "olympic_flag" }, 
//   // function(error, result) {console.log(result); }
//   );
// file has been uploaded successfully
fs.unlinkSync(localFilePath)
console.log(("File Uploaded Successfully On Cloudinary: ",response.url))

return response;
} catch(err) {
    fs.unlinkSync(localFilePath) // remove local file from our local server as file upload failed...
   console.log("Error Uploading on Cloudinary...: ", err)
}
}

export default uploadOnCloudinary;