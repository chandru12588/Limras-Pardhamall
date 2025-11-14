import React, { useState } from "react";

export default function Contact(){
  const [form, setForm] = useState({ name:"", email:"", message:"" });

  const handle = (e)=> setForm({...form, [e.target.name]: e.target.value});
  const submit = (e)=>{ e.preventDefault(); alert("Thanks! Message sent."); setForm({name:"",email:"",message:""});};

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input name="name" value={form.name} onChange={handle} placeholder="Name" className="p-3 border rounded" required />
        <input name="email" value={form.email} onChange={handle} placeholder="Email" className="p-3 border rounded" type="email" required />
        <textarea name="message" value={form.message} onChange={handle} placeholder="Message" rows="6" className="p-3 border rounded" required />
        <button className="btn-primary w-full">Send Message</button>
      </form>
    </div>
  );
}
