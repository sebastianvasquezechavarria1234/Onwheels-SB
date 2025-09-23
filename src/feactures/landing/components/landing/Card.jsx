import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export const Card = ({img,text,descripcion, dato, styleImage }) => {
  return (
    <>
      <Link className="">
        <picture className="relative group overflow-hidden h-[400px]   block  rounded-[20px]">
          <img
            className={`${styleImage} object-cover w-full h-[100%] group-hover:scale-[1.3] duration-200`}
            src={img}
            alt="img"
          />

          {/* texto */}

          <h4 className="gradient-backdrop absolute z-20 top-2 left-3 text-white rounded-full font-primary p-[3px_15px] ">
            {text}
          </h4>


          <div className="gradient-backdrop w-full flex absolute bottom-0 left-0 p-[3px_10px]">
              <p className="  z-20 bottom-5 m-3 text-white line-clamp-2 w-[60%]">
              {descripcion }
              </p>

              <p className=" font-primary z-20 bottom-5 text-white text-[30px]! ">
                {dato}
                </p>
         
          </div>
          
        </picture>

      </Link>
     
      

      
    </>
  );
};
