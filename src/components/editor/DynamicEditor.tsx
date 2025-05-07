"use client";
 
import dynamic from "next/dynamic";
 
export const Editor = dynamic(() => import("./Editor").then(mod => mod.Editor), { ssr: false });