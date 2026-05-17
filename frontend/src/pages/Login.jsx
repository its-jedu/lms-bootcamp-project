import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/auth/useAuth";



export default function Login() {
  const [formdata, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  function handleChange(e) {
  setFormData({ ...formdata, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try{
      const data = await login(formdata);
      const role = data?.user?.role;
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "employee") {
        navigate("/employee");
      }
    } catch(error){
      alert("Wrong credentials");
    }finally{
      setLoading(false);
    }
  };

  return (
    // main container div
    <div className="flex min-h-screen">
      {/* Left side Info section */}
      <div className=" bg-green-950 flex flex-1 items-center justify-center flex-col">
        <div className="flex flex-col items-start p-48">
            <div className="flex justify-start"><img src="./Dark-variation-logo.png" alt="Skillminds logo" className="w-60" /></div>
            <h2 className="text-green-100 text-3xl pb-4">Unlock your Learning Potential</h2>
            <p className="text-green-100 text-xl m-0 p-0 text-left" >Sign in to continue your journey of growth and kowledge.
              Explore courses, track progress and achieve your goals
            </p>
        </div>    
      </div>
      {/* Right Side Login section */}
      <div className="flex flex-1 items-center justify-center">
         

            {/* Card */}
            <div className="relative w-full max-w-2xl">

              <div className="bg-white   rounded-2xl p-10 shadow-2xl shadow-black/60">

                {/* Logo / brand mark */}
                


                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Email */}
                  <div>
                    <label className="block text-md uppercase tracking-widest text-black mb-2 flex items-start pb-4">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formdata.email}
                      onChange={handleChange}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="ENTER EMAIL"
                      className={`w-full border rounded-lg px-4 py-3 text-stone-400 placeholder-stone-400 text-md outline-none transition-all duration-200 `}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-md uppercase tracking-widest text-black mb-2 flex items-start pb-4">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        name="password"
                        value={formdata.password}
                        onChange={handleChange}
                        onFocus={() => setFocused("password")}
                        onBlur={() => setFocused(null)}
                        placeholder="••••••••"
                        className={`w-full border rounded-lg px-4 py-3 pr-12  text-stone-400 placeholder-stone-400 text-sm outline-none transition-all duration-200`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-300 transition-colors"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember / Forgot */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-4 h-4 border border-green-600 rounded bg-green-800 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all" />
                        <svg
                          className="absolute top-0.5 left-0.5 w-3 h-3 text-green-950 opacity-0 peer-checked:opacity-100 transition-opacity"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-xs text-green-500 group-hover:text-green-400 transition-colors">
                        Remember me
                      </span>
                    </label>
                    <a href="#" className="text-xs text-green-500/80 hover:text-amber-400 transition-colors tracking-wide">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 relative overflow-hidden bg-green-950 hover:bg-green-950 disabled:bg-amber-800 text-white font-semibold text-sm tracking-widest uppercase py-3.5 rounded-lg transition-all duration-200 group"
                  >
                    <span className={`transition-all duration-200 ${loading ? "opacity-0" : "opacity-100"}`}>
                      Sign In
                    </span>
                    {loading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin w-5 h-5 text-green-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      </span>
                    )}
                  </button>

                </form>

              

              
              </div>

            </div>
      </div>
            
    </div>
  );
}