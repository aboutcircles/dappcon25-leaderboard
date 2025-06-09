'use client';
import React, { useEffect, useState } from 'react';
import './starry.css';

const generateBoxShadows = (count: number) => {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadows.push(`${x}px ${y}px #FFF`);
  }
  return shadows.join(', ');
};

const StarryBackground = () => {
  const [smallStars, setSmallStars] = useState('');
  const [mediumStars, setMediumStars] = useState('');
  const [bigStars, setBigStars] = useState('');

  useEffect(() => {
    setSmallStars(generateBoxShadows(700));
    setMediumStars(generateBoxShadows(200));
    setBigStars(generateBoxShadows(100));
  }, []);

  // Optionally, render nothing until stars are generated
  if (!smallStars || !mediumStars || !bigStars) return null;

  return (
    <div className="starry-bg">
      <div id="stars" style={{ boxShadow: smallStars }}></div>
      <div id="stars2" style={{ boxShadow: mediumStars }}></div>
      <div id="stars3" style={{ boxShadow: bigStars }}></div>
    </div>
  );
};

export default StarryBackground;
