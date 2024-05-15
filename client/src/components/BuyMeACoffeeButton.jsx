import React from "react";
import BuymeCoffee from './bmc-button.png'

function BuyMeACoffeeButton() {
  return (
    <a href="https://www.buymeacoffee.com/siddharth25op" target="_blank">
      <img
        style={{ height: "50px" }}
        alt="Buy Me a Coffee Widget"
        src={BuymeCoffee}
      />
    </a>
  );
}

export default BuyMeACoffeeButton;