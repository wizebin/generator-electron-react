import React from 'react';
import moment from 'moment';

export default function Home() {
  return (
    <div>Home {moment().calendar()}</div>
  );
}
