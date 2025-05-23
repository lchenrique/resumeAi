"use client";
 
import dynamic from "next/dynamic";
 
export const Editor = dynamic(() => import("./EditorInstance").then(mod => mod.EditorInstance), { ssr: false });