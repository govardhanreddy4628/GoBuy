import { Box, Button, ButtonGroup, Checkbox, Divider, FormControlLabel, IconButton, TextField, Typography } from '@mui/material';

import { LiaShippingFastSolid } from "react-icons/lia";
import { GrReturn } from "react-icons/gr";
import { RiSecurePaymentLine } from "react-icons/ri";
import { IoGiftOutline } from "react-icons/io5";
import { TfiHeadphoneAlt } from "react-icons/tfi";

import { IoChatboxOutline } from "react-icons/io5";

import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaPinterestP } from "react-icons/fa";
import { FiYoutube } from "react-icons/fi";


const serviceItems = [
  {
    Icon: LiaShippingFastSolid,
    title: 'Free Shipping',
    description: 'For all Orders Over $100',
  },
  {
    Icon: GrReturn,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    Icon: RiSecurePaymentLine,
    title: 'Secure Payment',
    description: '100% secure payment',
  },
  {
    Icon: IoGiftOutline,
    title: 'Gift Service',
    description: 'Free gift wrapping',
  },
  {
    Icon: TfiHeadphoneAlt,
    title: '24/7 Support',
    description: 'We are here to help',
  },
];

const Footer = () => {
  // navigator.geolocation.getCurrentPosition((location) => {
  //   console.log(location)
  // },
  //   () => { console.log("no location") })
  return (
    <>
      <Divider className='dark:!bg-gray-400 !mx-auto shadow-lg w-full' />      <div className='dark:bg-gray-800'>
        <div className="flex flex-wrap justify-center gap-16 py-12">
          {serviceItems.map(({ Icon, title, description }, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-3 max-w-[250px] group">
              <Icon className="sm:text-[40px] text-[20px] group-hover:-translate-y-2 transition-all duration-500 group-hover:text-red-500" />
              <h3 className="text-[18px] font-medium">{title}</h3>
              <p className="text-[14px] text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>


        <Divider className='dark:!bg-gray-300 !w-[95%] !mx-auto' />

        <div className='flex flex-col lg:flex-row justify-start gap-4 w-[95%] mx-auto py-10'>
          <div className='flex flex-col gap-2 lg:w-[30%]'>
            <h3 className='text-[24px]'>Contact us</h3>
            <p className='text-gray-600 dark:text-gray-400'>Go Buy - Mega Super Store
              507-Union Trade Centre Hyderabad</p>
            <h1 className='text-red-500 text-[26px]'>(+91) 9876-543-210</h1>
            <div className='flex gap-4 items-center'>
              <IoChatboxOutline className='text-[30px] text-red-500' />
              <h3>Online Chat Get Expert Help</h3>
            </div>
          </div>


          <div className="w-[1px] bg-gray-300 mx-4"></div>

          <div className='flex flex-col lg:flex-row gap-6 justify-between lg:w-[70%]'>
            <div className='flex flex-col gap-3'>
              <h1 className='text-[24px]'>Products</h1>
              <ul className='flex flex-col gap-2'>
                <li className='text-gray-600 dark:text-gray-400'>Price drop</li>
                <li className='text-gray-600 dark:text-gray-400'>New products</li>
                <li className='text-gray-600 dark:text-gray-400'>Best sales</li>
                <li className='text-gray-600 dark:text-gray-400'>Contact us</li>
                <li className='text-gray-600 dark:text-gray-400'>Site map</li>
                <li className='text-gray-600 dark:text-gray-400'>Stores</li>
              </ul>
            </div>
            <div className='flex flex-col gap-3'>
              <h1 className='text-[24px]'>Our Company</h1>
              <ul className='flex gap-2 flex-col'>
                <li className='text-gray-600 dark:text-gray-400'>Delivery</li>
                <li className='text-gray-600 dark:text-gray-400'>Legal notice</li>
                <li className='text-gray-600 dark:text-gray-400'>Terms and conditions</li>
                <li className='text-gray-600 dark:text-gray-400'>About us</li>
                <li className='text-gray-600 dark:text-gray-400'>Secure payment</li>
                <li className='text-gray-600 dark:text-gray-400'>Login</li>
              </ul>
            </div>
            
            <div className='max-w-96 flex flex-col gap-4'>
              <h1 className='text-[24px]'>Subscribe To Newsletter</h1>
              <p className='text-gray-600 dark:text-gray-400'>Subscribe to our latest newsletter to get news about special discounts.</p>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Enter your email"
                size="small"
                InputProps={{
                  className:
                    "bg-white dark:bg-gray-900 text-black dark:text-white rounded-md",
                }}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d1d5db",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ef4444",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ef4444",
                  },
                }}
              />              <Button variant="contained" sx={{ width: 160 }} className='!bg-red-500'>SUBSCRIBE</Button>
              <FormControlLabel
                className="text-gray-600 dark:text-gray-400"
                control={
                  <Checkbox
                    size="small"
                    sx={{
                      color: "#9ca3af",
                      "&.Mui-checked": {
                        color: "#ef4444",
                      },
                    }}
                  />
                }
                label="Accept Terms and Conditions"
              />
            </div>
          </div>
        </div>
      </div>


      <Box
        sx={{
          position: 'static',
          bottom: 0,
          width: '100%',
          backgroundColor: '#f8f9fa',
          padding: '10px',
          textAlign: 'center',
          boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          margin: '0 auto',
          alignItems: 'center',
        }} className='dark:bg-gray-900'>
        <Box sx={{ width: '95%', gap: "80px" }}>
          <ButtonGroup color="primary" aria-label="outlined primary button group" sx={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: "center" }}>
            {[FaFacebookF, FaInstagram, FiYoutube, FaPinterestP].map((Icon, index) => (
              <IconButton aria-label="search" className='!text-gray-700 dark:!text-gray-200 bg-gray-200 border border-gray-300 shadow hover:!bg-red-500 hover:!text-white transition duration-500' key={index} >
                <Icon className='!text-[18px]' />
              </IconButton>
            ))}
          </ButtonGroup>
          <Typography variant="body2" color="textSecondary" className='text-gray-700 dark:text-gray-200'>
            © {new Date().getFullYear()} Go Buy. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </>
  )
}

export default Footer
