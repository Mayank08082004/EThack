'use client';

import { useEffect } from "react";
import API from "../services/api";
export default function Home() {
useEffect(() => {
  API.get("/").then(res => console.log(res.data));
}, []);

  return <div>Frontend working 🚀</div>;
}