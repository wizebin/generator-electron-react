import React, { useEffect, useState } from 'react';

export default function StateLoader(props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // put your persisted state loading code here
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return props.children;
}
