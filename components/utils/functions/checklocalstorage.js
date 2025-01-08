import { useEffect } from 'react';

const onLocal_Storage_Changed = (callback) => {
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.storageArea === localStorage) {
        callback();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [callback]);
};

export default onLocal_Storage_Changed;


// call this somewhere to keep track of changes in storage to avoid 
// the possibility of modifying the token or other details