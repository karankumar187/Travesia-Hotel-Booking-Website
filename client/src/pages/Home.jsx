import React from 'react';  
import Hero from '../components/Hero';
import FeaturedDestination from '../components/featuredDestination';
import ExclusiveOffers from '../components/ExclusiveOffers';
import Testimonial from '../components/Testimonial';
import NewsLetter from '../components/NewsLetter';
import RecommendedHotels from '../components/RecommendedHotels1';

const Keyframes = () => (
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fade-in-up {
        animation-name: fadeInUp;
        animation-duration: 650ms;
        animation-timing-function: cubic-bezier(.25,.8,.25,1);
        animation-fill-mode: both;
      }
    `}</style>
  );

function Home(){
    return(
        <div>
            <Keyframes />
            <Hero />
            <RecommendedHotels />
            <FeaturedDestination />
            <ExclusiveOffers></ExclusiveOffers>
            <Testimonial />
            <NewsLetter />
        </div>
    )
}

export default Home;