import React, { useState, useRef, useEffect } from 'react';
import ExpandableItem from './Expandableitem';
import { useRouter } from 'next/router';

import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cookies from 'js-cookie';

function Sidebar({
  highlightItem="home"
}) {
  const sidebarRef = useRef(null);
  const router = useRouter();


  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);


  const handlesalesClick = (optionIndex) => {
    try {
      switch (optionIndex) {
        case 0:
          router.push("/sales/invoice/add");
          break;
        case 1:
          router.push("/sales/estimate");
          break;
      }
    } catch (error) {
      console.error('Error while navigating:', error);
    }
  };

  const handlepurchaseClick2 = (optionIndex) => {
    try {
      switch (optionIndex) {
        case 0:
          router.push("/purchase/invoice");
          break;
        case 1:
          router.push("/purchase/estimate");
          break;
      }
    } catch (error) {
      console.error('Error while navigating:', error);
    }
  };


  function cleartoken() {
    Cookies.remove('userToken',{path:'/'})
    localStorage.clear();

  }
  


  return (

    <div className="sidebar no_select_text " tabIndex="-1">
      <a
        className={highlightItem == "home" ? "active" : ""}
        style={{
          pointerEvents: useRouter().asPath.split("/")[1] === "home" ? "none" : "auto",
        }}
        href="/home"
        tabIndex="-1" >
        Home
      </a>
      <a
        // className={useRouter().asPath.split("/")[1] == "parties" ? "active" : ""}
        className={highlightItem == "parties" ? "active" : ""}
        style={{ pointerEvents: useRouter().asPath.split("/")[1] === "parties" ? "none" : "auto" }}
        href="/parties"
        tabIndex="-1" >
        Parties
      </a>
      <a
        className={highlightItem == "items" ? "active" : ""}
        style={{ pointerEvents: useRouter().asPath.split("/")[1] === "items" ? "none" : "auto" }}
        href="/items"
        tabIndex="-1"  >
        Items
      </a>
      <ExpandableItem
        highlightThis={highlightItem == "sales"}
        title="Sales"
        options={["Invoice", "Estimate",]}
        handleOptionClick={handlesalesClick}
      />
      <ExpandableItem
        highlightThis={highlightItem == "purchase"}
        title="Purchase"
        options={["Invoice", "Estimate",]}
        handleOptionClick={handlepurchaseClick2}
      />

      <a
        className='sidebarlogout'
        onClick={cleartoken}
        href="/"
        tabIndex="-1" >
        Log Out
        <FontAwesomeIcon
          className="sidebarlogout_icon"
          icon={faArrowRightFromBracket}
        />
      </a>

    </div>

  );

};

export default Sidebar;
