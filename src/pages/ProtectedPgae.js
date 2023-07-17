// protectedroute.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase';

const ProtectedPage = ({ children, allowedEmails }) => {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
        setUserEmail(user.email);
      } else {
        setLoggedIn(false);
        setUserEmail(null);
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const isAllowed = allowedEmails ? allowedEmails.includes(userEmail) : true;

  if (!loggedIn || !isAllowed) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedPage;
