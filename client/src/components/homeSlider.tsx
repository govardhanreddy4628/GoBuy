import { Navigation, Pagination, Keyboard, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import image2 from '../assets/banner/img2.webp';
import image5 from '../assets/banner/img5.webp';
import image3 from '../assets/banner/img3.jpg';

const HomeSlider = () => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        (e.target as HTMLImageElement).onerror = null; // prevent infinite loop
        (e.target as HTMLImageElement).src = 'https://graphicsfamily.com/wp-content/uploads/edd/2021/07/Professional-E-Commerce-Shoes-Banner-Design.jpg'; // your fallback image
    }
  return (
    <section>
                <div className='h-[60vh] flex items-center justify-center bg-gray-100 dark:bg-gray-800 pt-5 mx-auto'>
                    <Swiper navigation={true} modules={[Navigation, Pagination, Keyboard, Autoplay]} className="mainSwiper w-[95%] h-full rounded-lg !border-none" spaceBetween={10} slidesPerView={1} pagination={{ clickable: true }}
                        keyboard={true} autoplay={{ delay: 4500, disableOnInteraction: false }} centeredSlides={true}>
                        <SwiperSlide className='overflow-hidden rounded-lg border-none'><img src={image2} className='w-full h-full object-cover' onError={(e) => { handleImageError(e) }} /></SwiperSlide>
                        <SwiperSlide className='overflow-hidden rounded-lg border-none'><img src={image3} className='w-full h-full object-cover' /></SwiperSlide>
                        <SwiperSlide className='overflow-hidden rounded-lg border-none'><img src={image5} className='w-full h-full object-cover' /></SwiperSlide>
                        <SwiperSlide className='overflow-hidden rounded-lg border-none'><img src="https://graphicsfamily.com/wp-content/uploads/edd/2021/07/Professional-E-Commerce-Shoes-Banner-Design.jpg" className='w-full h-full object-cover' /></SwiperSlide>
                    </Swiper>
                </div>
            </section>
  )
}

export default HomeSlider
