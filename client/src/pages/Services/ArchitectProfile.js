import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { HiBadgeCheck } from "react-icons/hi";
import { useParams } from 'react-router-dom';
import StarRating from '../../components/StarRating/StarRating';
import { GetData } from '../../utils/sessionStoreage';
// import { GetData } from '../../utils/sessionStoreage'

function ArchitectProfile() {
    const { id } = useParams()
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviews, setReviews] = useState([]);
    const Data = GetData('user')
    const UserData = JSON.parse(Data)
    // console.log("UserData",UserData)
    const [VenderType, setVenderType] = useState('');
    const [ratingCounts, setRatingCounts] = useState({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    });
    const [ratingPercentages, setRatingPercentages] = useState({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    });
    const [selectedCategory, setSelectedCategory] = useState('Residential'); // Default category
    const [allService, setAllService] = useState({});
    const [profileLoading, setProfileLoading] = useState(true);
    //   const [loading, setLoading] = useState(false);

    const handleFetchProvider = async (providerId) => {
        setLoading(true);
        try {
            // Fetch services for the selected category
            const { data } = await axios.get(
                `https://api.helpubuild.co.in/api/v1/get-service-by-provider/${providerId}/${selectedCategory}`
            );

            // Find the service data for the selected category
            const serviceData = data.data.find(
                (service) => service.category === selectedCategory
            );

            // Update state with the selected category data
            if (serviceData) {
                setAllService(serviceData);
            } else {
                setAllService({});
            }
        } catch (error) {
            console.error('Error fetching provider data', error);
        } finally {
            setLoading(false);
        }
    };

    // console.log("allService",allService)

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    useEffect(() => {
        if (id) {
            handleFetchProvider(id);
        }
        // handleFetchProvider();
    }, [selectedCategory, id]);

    const [formData, setFormData] = useState({
        userId: '',
        providerId: id,
    })

    const handleActiveTime = async (Chat) => {
        if (!UserData) {
            return toast.error('Login first')
        }
        if (UserData.role === 'provider') {
            return toast.error("Access Denied: Providers are not authorized to access this feature.");
        }
        if (!profile.pricePerMin || profile.pricePerMin <= 0) {
            return toast.error("Chat cannot be started. Provider pricing information is unavailable or invalid.");
        }
        if (Chat === 'Chat') {

            const newForm = {
                ...formData,
                userId: UserData._id,
            }
            try {
                const res = await axios.post('https://api.helpubuild.co.in/api/v1/create-chat', newForm)
                window.location.href = '/chat'
            } catch (error) {
                console.log("Internal server error", error)
                toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
            }
        }
    }

    useEffect(() => {
        if (id) {
            fetchProfile(id);
        }
    }, [id]);

    const fetchProfile = async (id) => {
        setProfileLoading(true)
        try {
            const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/get-single-provider/${id}`);
            setProfile(data.data);
            setVenderType(data.data.type)
            setProfileLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Unable to fetch profile. Please try again later.');
            setProfileLoading(false);
            toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later")
        } finally {
            setProfileLoading(false);
        }
    };

    const handleFetchReview = async () => {
        try {
            const { data } = await axios.get(
                `https://api.helpubuild.co.in/api/v1/get-review-by-providerId/${id}`
            );
            console.log("Reviews fetched:", data.data);
            setReviews(data.data);

            // Calculate rating counts
            const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            data.data.forEach((review) => {
                counts[review.rating] = (counts[review.rating] || 0) + 1;
            });

            setRatingCounts(counts);

            // Calculate percentages
            const totalRatings = Object.values(counts).reduce((sum, count) => sum + count, 0);
            const percentages = {};
            Object.entries(counts).forEach(([rating, count]) => {
                percentages[rating] = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
            });

            setRatingPercentages(percentages);
        } catch (error) {
            console.log("Internal server error in fetching reviews", error);
        }
    };

    useEffect(() => {
        handleFetchReview();
    }, [])

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-danger">{error}</div>;
    }

    if (!allService) {
        return <div className="text-center">No services available</div>
    }

    if (profileLoading) {
        return <div className="text-center">Loading profile...</div>;
    }

    return (
        <>
            <div className='main-bg'>
                <section className='architecture-section-one'>
                    <div className='container-fluid architecture-section-p pt-3'>
                        <div className='row'>
                            {/* Breadcrumbhy */}
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <a href="#">Home</a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        {profile.name || 'N/A'}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    <div className='container-fluid architecture-section-p rounded'>
                        <div className='row prfile-custom-card px-4 py-5 align-items-center'>
                            <div className='col-xl-4 col-lg-4 col-md-6 col-12'>
                                <div className='a-profile-image text-center'>
                                    <img src={profile?.photo?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random`} alt="Profile Picture" className="text-center" /><br />
                                    {/* <button className="btn profile-follow-btn mt-3">Follow us</button> */}
                                </div>
                            </div>
                            <div className='col-xl-4 col-lg-4 col-md-6 col-12'>
                                <div className='profile-info'>
                                    <h4 className='fw-bold archi-profile-name'>
                                        {profile.name ? (
                                            <>
                                                {profile.name} <HiBadgeCheck />
                                            </>
                                        ) : (
                                            "Profile is not Updated"
                                        )}
                                    </h4>

                                    <p className="archi-cateogry">
                                        {profile.type ? profile.type : "Profile is not Updated"}
                                    </p>

                                    <p className='archi-Language'>
                                        {profile.language && profile.language.length > 0 ? (
                                            profile.language.map((lang, index) => (
                                                <span key={index} className="archi-language-tag">
                                                    {lang}{index < profile.language.length - 1 ? ', ' : ''}
                                                </span>
                                            ))
                                        ) : (
                                            "Profile is not Updated"
                                        )}
                                    </p>

                                    <p className='archi-experties'>
                                        {profile.expertiseSpecialization && profile.expertiseSpecialization.length > 0 ? (
                                            profile.expertiseSpecialization.map((specialization, index) => (
                                                <span key={index} className="archi-language-tag">
                                                    {specialization}{index < profile.expertiseSpecialization.length - 1 ? ', ' : ''}
                                                </span>
                                            ))
                                        ) : (
                                            "Profile is not Updated"
                                        )}
                                    </p>

                                    <p className='archi-exp'>
                                        {profile.experience ? `Exp: ${profile.experience} Years` : "Experience is not Updated"}
                                    </p>

                                    <p className="fw-bold archi-duration-price">
                                        {profile.pricePerMin ? `₹ ${profile.pricePerMin}/min` : "Pricing is not Updated"}
                                    </p>
                                    {/* Uncomment if required */}
                                    {/* <p className="text-muted total-archi-duration">59K mins | 29K mins</p> */}
                                </div>
                            </div>

                            <div className='col-xl-4 col-lg-4 col-md-6 col-12'>
                                <div className='connect-area'>
                                    <button className={`btn ${profile.callStatus === true ? 'profile-chat-btn' : 'profile-call-btn'}`} disabled={!profile.callStatus} ><i class="fa-solid fa-phone-volume"></i> Call</button>
                                    <button onClick={() => handleActiveTime("Chat")} disabled={!profile.chatStatus} className={`btn mt-2 ${profile.chatStatus === true ? 'profile-chat-btn' : 'profile-call-btn'}`}><i class="fa-regular fa-comments"></i> Chat</button>
                                    <button className={`btn mt-2 ${profile.meetStatus === true ? 'profile-chat-btn' : 'profile-call-btn'}`} disabled={!profile.meetStatus}><i class="fa-solid fa-video"></i> Video</button>
                                </div>
                            </div>

                            <div className="container mt-5">


                                {/* Services Display */}
                                <div className="row mt-5">
                                    {VenderType !== 'Vastu' && (
                                        loading ? (
                                            <div className="text-center">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="col-12">
                                                <div className="text-center">
                                                    <h2 className="mb-4">Our Services</h2>
                                                    <p className="text-muted">
                                                        Choose a category to view the specialized services we offer.
                                                    </p>
                                                </div>

                                                <div className="d-flex justify-content-center align-items-center gap-3">
                                                    <button
                                                        onClick={() => handleCategoryChange('Residential')}
                                                        className={`btn ${selectedCategory === 'Residential' ? 'btn-primary' : 'btn-outline-primary'} px-4`}
                                                    >
                                                        Residential
                                                    </button>
                                                    <button
                                                        onClick={() => handleCategoryChange('Commercial')}
                                                        className={`btn ${selectedCategory === 'Commercial' ? 'btn-primary' : 'btn-outline-primary'} px-4`}
                                                    >
                                                        Commercial
                                                    </button>
                                                    <button
                                                        onClick={() => handleCategoryChange('Landscape')}
                                                        className={`btn ${selectedCategory === 'Landscape' ? 'btn-primary' : 'btn-outline-primary'} px-4`}
                                                    >
                                                        Landscape
                                                    </button>
                                                </div>
                                                <div className="card shadow-sm p-4 mt-4">
                                                    <h3 className="text-center mb-4">
                                                        {selectedCategory} Services
                                                    </h3>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Concept Design</h5>
                                                            <p className="text-muted">
                                                                {allService?.conceptDesignWithStructure
                                                                    ? `₹${allService.conceptDesignWithStructure}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Building Service MEP</h5>
                                                            <p className="text-muted">
                                                                {allService?.buildingServiceMEP
                                                                    ? `₹${allService.buildingServiceMEP}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Working Drawing</h5>
                                                            <p className="text-muted">
                                                                {allService?.workingDrawing
                                                                    ? `₹${allService.workingDrawing}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Interior 3D</h5>
                                                            <p className="text-muted">
                                                                {allService?.interior3D
                                                                    ? `₹${allService.interior3D}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="col-md-6 mb-3">
                                                            <h5>Exterior 3D</h5>
                                                            <p className="text-muted">
                                                                {allService?.exterior3D
                                                                    ? `₹${allService.exterior3D}/sq. ft.`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}


                                </div>
                            </div>





                            <div className='col-xl-12'>
                                <div className='about-architect'>
                                    <h3 className='about-title mb-4'>About me</h3>

                                    <p className='text-center'>{profile?.bio || 'No bio available'}</p>

                                </div>
                            </div>
                            <div className='col-lg-12 mt-4' >
                                {/* <!-- Pills navs --> */}
                                <ul className="nav nav-pills gap-3 mb-3 d-flex justify-content-center" id="ex1" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <a
                                            className="nav-link active"
                                            id="ex2-tab-1"
                                            data-bs-toggle="pill"
                                            href="#ex2-pills-1"
                                            role="tab"
                                            aria-controls="ex2-pills-1"
                                            aria-selected="true"
                                        >
                                            Gallery
                                        </a>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <a
                                            className="nav-link"
                                            id="ex2-tab-2"
                                            data-bs-toggle="pill"
                                            href="#ex2-pills-2"
                                            role="tab"
                                            aria-controls="ex2-pills-2"
                                            aria-selected="false"
                                        >
                                            Portfolio
                                        </a>
                                    </li>
                                </ul>
                                {/* <!-- Pills navs --> */}

                                {/* <!-- Pills content --> */}
                                <div className="tab-content" id="ex2-content">
                                    <div
                                        className="tab-pane show active"
                                        id="ex2-pills-1"
                                        role="tabpanel"
                                        aria-labelledby="ex2-tab-1"
                                    >
                                        <div className="gallery profile-about-gallery row">
                                            {
                                                profile?.portfolio?.GalleryImages && profile?.portfolio?.GalleryImages.map((image, index) => (
                                                    <div key={index} className="col-6 col-sm-4">
                                                        <img src={image?.url} alt="Profile Picture" className="img-fluid rounded" />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <div
                                        className="tab-pane"
                                        id="ex2-pills-2"
                                        role="tabpanel"
                                        aria-labelledby="ex2-tab-2"
                                    >
                                        <div className="gallery profile-about-gallery row">
                                            <div className="col-6 col-sm-4 d-flex align-items-center justify-content-center w-100">
                                                <iframe
                                                    src={profile?.portfolio?.PortfolioLink?.url}
                                                    width="100%"
                                                    height="600px"
                                                    title="Portfolio PDF"
                                                ></iframe>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* <!-- Pills content --> */}


                            </div>
                        </div>
                    </div>
                    <div className='container-fluid architecture-section-p'>
                        <div className='row mt-4'>
                            <div className='col-lg-6'>
                                <div className="card prfile-custom-card  p-4 mb-4">
                                    <h5 className="mb-3">Rating &amp; Reviews</h5>
                                    <div className="d-flex align-items-center mb-3">
                                        <span className="rating-value me-3">{profile.averageRating || 0}</span>
                                        <StarRating rating={profile.averageRating || 0} />
                                    </div>
                                    <p className="mb-4">
                                        <small>
                                            <i className="bi bi-person" /> {reviews.length} total
                                        </small>
                                    </p>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="me-2">5</span>
                                        <div className="progress flex-grow-1">
                                            <div
                                                className="progress-bar rating-bar rating-bar-5"
                                                role="progressbar"
                                                style={{ width: `${ratingPercentages[5]}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="me-2">4</span>
                                        <div className="progress flex-grow-1">
                                            <div
                                                className="progress-bar rating-bar rating-bar-5"
                                                role="progressbar"
                                                style={{ width: `${ratingPercentages[4]}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="me-2">3</span>
                                        <div className="progress flex-grow-1">
                                            <div
                                                className="progress-bar rating-bar rating-bar-5"
                                                role="progressbar"
                                                style={{ width: `${ratingPercentages[3]}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="me-2">2</span>
                                        <div className="progress flex-grow-1">
                                            <div
                                                className="progress-bar rating-bar rating-bar-5"
                                                role="progressbar"
                                                style={{ width: `${ratingPercentages[2]}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="me-2">1</span>
                                        <div className="progress flex-grow-1">
                                            <div
                                                className="progress-bar rating-bar rating-bar-5"
                                                role="progressbar"
                                                style={{ width: `${ratingPercentages[1]}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className='col-lg-6'>
                                <div className='review-title'>
                                    <h5 className="mb-4 card bg-white p-3 rounded">User Reviews</h5>
                                </div>
                                <div className='user-review-area'>
                                    {
                                        reviews && reviews.map((item, index) => (
                                            <div className="review-card">
                                                <div key={index} className="d-flex align-items-start">
                                                    <img
                                                        src={item?.userId?.ProfileImage?.imageUrl || `https://ui-avatars.com/api/?background=random&name=${item?.userId?.name}`}
                                                        alt={item?.userId?.name}
                                                        className="review-profile-image me-3"
                                                    />
                                                    <div>
                                                        <h6 className="mb-1">{item?.userId?.name}</h6>
                                                        {/* {console.log(item)} */}
                                                        <div className="review-stars"><StarRating rating={item.averageRating} /></div>
                                                        <p className="mt-2 mb-0">{item.review}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }

                                </div>
                            </div>
                        </div>
                    </div>

                </section>
            </div>
        </>
    )
}

export default ArchitectProfile;