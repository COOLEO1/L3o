import React from "react";
import "./SplashScreen.css";

/**
 * L3o AI — Splash Screen
 * Created by Leon Mapelera 🇲🇼
 *
 * Signature moment: a pulsing neural orb made of concentric rings and
 * orbiting nodes, echoing the "L3o AI" mark before the console loads.
 */
export default function SplashScreen({ visible }) {
  return (
    <div className={`splash ${visible ? "splash--visible" : "splash--hidden"}`}>
      <div className="splash__orb-wrap" aria-hidden="true">
        <div className="splash__ring splash__ring--outer" />
        <div className="splash__ring splash__ring--inner" />
        <div className="splash__core" />
        <span className="splash__node splash__node--1" />
        <span className="splash__node splash__node--2" />
        <span className="splash__node splash__node--3" />
      </div>

      <h1 className="splash__title">
        L<span className="splash__title-accent">3</span>o AI
      </h1>
      <p className="splash__subtitle">
        Created by <strong>Leon Mapelera</strong> 🇲🇼
      </p>

      <div className="splash__loadbar">
        <div className="splash__loadbar-fill" />
      </div>
    </div>
  );
}
