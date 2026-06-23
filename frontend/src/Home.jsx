import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
    // useState() ek hook hai jo data ko save karne ke liye use hota hai.
    // 'videos' hamara data variable hai, aur 'setVideos' function hai us data ko change karne ke liye.
    // Shuru mein humne ek khali array [] diya hai kyunki initially koi video nahi hai.
    const [videos, setVideos] = useState([]);

    // 'loading' state ye batane ke liye hai ki API call chal rahi hai ya nahi.
    // Shuru mein 'true' rakha hai kyunki page load hote hi request jayegi.
    const [loading, setLoading] = useState(true);

    // 'error' state kisi bhi problem ko dikhane ke liye hai, jaise network error.
    const [error, setError] = useState(null);

    // useEffect() hook page ke render hote hi ek specific task chalane ke liye hota hai.
    // Last mein jo empty array [] diya hai, uska matlab hai ki ye sirf ek baar chalega (jab page load hoga).
    useEffect(() => {
        // Ek asynchronous function banaya hai jo API call karega.
        const fetchVideos = async () => {
            try {
                // setLoading(true) karke loading dikhana shuru kiya.
                setLoading(true);

                // axios.get() se hum apne backend server par GET request bhej rahe hain.
                // Yahan aapke backend ka address diya gaya hai (assume kar rahe hain port 8000).
                const response = await axios.get('http://localhost:8000/api/v1/videos');

                // Backend se jo response aaya, usme response.data ke andar hamara actual backend data (Apiresponse) hai.
                // Uske andar .data.docs me videos ki list aayegi (kyunki paginate use kiya tha backend me).
                // Agar docs nahi milta to directly data.data set kar dega (safety check ke liye fallback diya hai).
                setVideos(response.data.data.docs || response.data.data || []);
            } catch (err) {
                // Agar API call me koi error aati hai (jaise server band ho ya CORS error), to yahan catch hogi.
                console.error("Error fetching videos:", err);
                // error message ko state me set kiya taaki user ko dikha sakein.
                setError("Videos lane me error aayi. Kya backend chal raha hai?");
            } finally {
                // try ho ya catch, finally block hamesha chalega. Yahan hum loading ko false kar denge.
                setLoading(false);
            }
        };

        // Upar banaye gaye function ko call kiya hai yahan.
        fetchVideos();
    }, []); // Empty array ka matlab: Run only on component mount (jab page khule tab ek baar)

    // Component ke return me hum JSX (HTML inside JS) likhte hain jo screen par dikhega.

    // Agar loading abhi bhi true hai (API ka response nahi aaya), to ek Loading message dikhayenge.
    if (loading) {
        return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading Videos... ⏳</h2>;
    }

    // Agar koi error aayi thi, to red color me error message dikhayenge.
    if (error) {
        return <h2 style={{ textAlign: "center", color: "red", marginTop: "50px" }}>{error}</h2>;
    }

    // Agar sab theek hai, lekin videos ki list khali (empty) hai (matlab 0 videos hain).
    // User ne bataya tha ki abhi koi video upload nahi ki hai, isliye ye screen dikhegi.
    if (videos.length === 0) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <h2>Aapke Homepage Par Aapka Swagat Hai! 🎉</h2>
                <p>Abhi yahan koi video nahi hai. Video controller backend me kaam kar raha hai,</p>
                <p>lekin database mein koi video nahi hai kyuki Upload feature abhi frontend se nahi bana.</p>
            </div>
        );
    }

    // Agar data successfully aa gaya hai, to saari videos ko list karenge.
    return (
        <div style={{ padding: "20px" }}>
            <h2>All Videos 📺</h2>
            {/* Videos ko ek Grid layout me dikhane ke liye style diya hai */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                
                {/* videos array me .map() loop laga kar ek ek video ko UI me badal rahe hain */}
                {videos.map((video) => (
                    // Har loop item ko ek unique 'key' deni padti hai React ko taaki wo easily track kar sake.
                    <div key={video._id} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
                        
                        {/* Video ka thumbnail image tag */}
                        <img 
                            src={video.thumbnail} 
                            alt={video.title} 
                            style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "5px" }} 
                        />
                        
                        {/* Video ka title */}
                        <h3 style={{ marginTop: "10px" }}>{video.title}</h3>
                        
                        {/* Video ke views. Agar views property na ho to 0 dikhayenge */}
                        <p style={{ color: "gray" }}>Views: {video.views || 0}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Function ko export kiya taaki dusri files (jaise App.jsx) isko import kar sakein.
export default Home;
