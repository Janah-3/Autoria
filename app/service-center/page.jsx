"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ServiceCenterProfile() {
  return (
    <div className="sc-profile-layout">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sc-profile-layout {
          min-height: 100vh;
          background: #F4F7F6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          padding-bottom: 100px; /* space for sticky footer */
        }
        
        .top-nav {
          background: #fff;
          border-bottom: 1px solid #E5E7EB;
          height: 70px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .logo { font-size: 24px; font-weight: 900; color: #E8192C; text-decoration: none; }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .back-btn { font-size: 14px; font-weight: 600; color: #4B5563; text-decoration: none; border: 1px solid #D1D5DB; padding: 8px 16px; border-radius: 6px; }
        .user-badge { width: 36px; height: 36px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        /* Hero Section */
        .sc-hero {
          background: #10B981;
          border-radius: 16px;
          padding: 32px;
          color: white;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
        }

        .hero-left { display: flex; gap: 24px; }
        .sc-logo-box { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
        
        .sc-name { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
        .sc-meta { font-size: 14px; display: flex; align-items: center; gap: 8px; opacity: 0.9; margin-bottom: 12px; }
        
        .sc-tags { display: flex; gap: 8px; margin-bottom: 24px; }
        .tag-verified { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        
        .hero-stats { display: flex; gap: 32px; }
        .stat-item h3 { font-size: 24px; font-weight: 800; }
        .stat-item p { font-size: 13px; opacity: 0.8; }

        .hero-actions { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; }
        .btn-save { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.4); padding: 8px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .btn-save:hover { background: rgba(255,255,255,0.1); }
        .btn-book-top { background: white; color: #10B981; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

        /* Main Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); border: 1px solid #F3F4F6; margin-bottom: 24px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-title { font-size: 18px; font-weight: 700; color: #111827; }
        .card-link { color: #10B981; font-size: 14px; text-decoration: none; font-weight: 600; }

        /* Contact & Hours */
        .contact-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .contact-item { display: flex; gap: 12px; align-items: flex-start; }
        .contact-icon { width: 32px; height: 32px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4B5563; flex-shrink: 0; }
        .contact-text h4 { font-size: 12px; color: #6B7280; font-weight: 500; }
        .contact-text p { font-size: 15px; color: #111827; font-weight: 500; }
        .map-placeholder { background: #F3F4F6; height: 120px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6B7280; font-weight: 500; }

        /* Services & Brands */
        .tags-wrapper { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
        .service-tag { background: #ECFDF5; color: #059669; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; border: 1px solid #A7F3D0; }
        .brand-tag { background: #F3F4F6; color: #374151; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; border: 1px solid #E5E7EB; }

        .price-range { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F3F4F6; padding-top: 16px; }
        .price-info h4 { font-size: 12px; color: #6B7280; font-weight: 500; }
        .price-info p { font-size: 16px; font-weight: 700; color: #111827; }
        .spare-parts-toggle { font-size: 13px; color: #059669; font-weight: 600; display: flex; align-items: center; gap: 4px; }

        /* Photos Grid */
        .photos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .photo-box { height: 100px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: rgba(0,0,0,0.1); }
        .photo-box.c1 { background: #D1FAE5; }
        .photo-box.c2 { background: #FEF3C7; }
        .photo-box.c3 { background: #DBEAFE; }
        .photo-box.c4 { background: #FCE7F3; }

        /* Spare Parts */
        .part-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #F3F4F6; }
        .part-item:last-child { border-bottom: none; }
        .part-info h4 { font-size: 15px; font-weight: 600; color: #111827; }
        .part-info p { font-size: 13px; color: #6B7280; }
        .part-action { text-align: right; }
        .part-price { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .btn-reserve { background: #10B981; color: white; border: none; padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }

        /* Reviews */
        .rating-summary { display: flex; gap: 32px; margin-bottom: 24px; align-items: center; }
        .rating-big { text-align: center; }
        .rating-big h2 { font-size: 48px; font-weight: 800; color: #10B981; line-height: 1; }
        .rating-bars { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .bar-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6B7280; }
        .bar-bg { flex: 1; height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 100%; background: #F59E0B; border-radius: 3px; }

        .review-item { border-top: 1px solid #F3F4F6; padding: 16px 0; }
        .review-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .reviewer-name { font-weight: 600; font-size: 14px; color: #111827; }
        .review-date { font-size: 12px; color: #9CA3AF; }
        .review-text { font-size: 14px; color: #4B5563; line-height: 1.5; margin-bottom: 12px; }
        .review-photos { display: flex; gap: 8px; margin-bottom: 12px; }
        .r-photo { width: 40px; height: 40px; background: #F3F4F6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 18px; }
        .review-reply { background: #F9FAFB; padding: 12px; border-radius: 8px; border-left: 3px solid #10B981; font-size: 13px; color: #4B5563; }
        
        .btn-load { width: 100%; padding: 10px; background: white; border: 1px solid #D1D5DB; border-radius: 8px; font-weight: 600; color: #374151; cursor: pointer; }

        .write-review-box { background: #F0FDF4; border: 1px dashed #6EE7B7; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
        .write-review-box p { font-size: 14px; color: #047857; font-weight: 500; }
        .btn-write { background: #10B981; color: white; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }

        /* Sticky Footer */
        .sticky-footer { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #E5E7EB; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -4px 6px rgba(0,0,0,0.02); z-index: 40; }
        .footer-info h4 { font-size: 16px; font-weight: 700; color: #111827; }
        .footer-info p { font-size: 13px; color: #6B7280; }
        .btn-book-bottom { background: #10B981; color: white; padding: 12px 32px; border-radius: 8px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; }

        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
          .sc-hero { flex-direction: column; gap: 24px; }
          .hero-actions { align-items: flex-start; flex-direction: row; }
        }
      `}</style>

      <nav className="top-nav">
        <Link href="/user-dashboard" className="logo" style={{color: '#111827'}}>Autoria</Link>
        <div className="nav-right">
          <Link href="/user-dashboard" className="back-btn"><i className="fa-solid fa-arrow-left"></i> Back to results</Link>
          <div className="user-badge">AK</div>
        </div>
      </nav>

      <div className="container">
        
        {/* Hero */}
        <div className="sc-hero">
          <div className="hero-left">
            <div className="sc-logo-box"><i className="fa-solid fa-wrench"></i></div>
            <div>
              <h1 className="sc-name">AutoCare Nasr City</h1>
              <div className="sc-meta">
                <i className="fa-solid fa-location-dot"></i> Nasr City, Cairo • Open today 09:00-18:00
              </div>
              <div className="sc-tags">
                <span className="tag-verified"><i className="fa-solid fa-check"></i> Verified</span>
                <span className="tag-verified">Toyota Authorized</span>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <h3>4.8</h3>
                  <p><i className="fa-solid fa-star" style={{fontSize: '10px'}}></i> Rating</p>
                </div>
                <div className="stat-item">
                  <h3>138</h3>
                  <p>Reviews</p>
                </div>
                <div className="stat-item">
                  <h3>6</h3>
                  <p>Service Bays</p>
                </div>
                <div className="stat-item">
                  <h3>2015</h3>
                  <p>Est.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-actions">
            <button className="btn-save"><i className="fa-regular fa-bookmark"></i> Save</button>
            <button className="btn-book-top">Book Now</button>
          </div>
        </div>

        <div className="content-grid">
          
          {/* Left Column */}
          <div className="left-col">
            
            {/* Contact & Hours */}
            <div className="card">
              <h2 className="card-title" style={{marginBottom: '20px'}}>Contact & Hours</h2>
              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-icon"><i className="fa-solid fa-phone"></i></div>
                  <div className="contact-text">
                    <h4>Phone</h4>
                    <p>+20 1012 345 678</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon"><i className="fa-brands fa-whatsapp"></i></div>
                  <div className="contact-text">
                    <h4>WhatsApp</h4>
                    <p>+20 1012 345 678</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon"><i className="fa-solid fa-location-dot"></i></div>
                  <div className="contact-text">
                    <h4>Address</h4>
                    <p>14 Omar Ibn El-Khattab St, Nasr City</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon"><i className="fa-regular fa-clock"></i></div>
                  <div className="contact-text">
                    <h4>Working Hours</h4>
                    <p>Sun-Thu 09:00-18:00 • Sat 10:00-15:00</p>
                    <p style={{color: '#EF4444', fontSize: '13px', marginTop: '4px'}}>Friday: Closed</p>
                  </div>
                </div>
              </div>
              <div className="map-placeholder">
                <i className="fa-solid fa-map-location-dot" style={{marginRight: '8px'}}></i> Map — Nasr City, Cairo
              </div>
            </div>

            {/* Services Offered */}
            <div className="card">
              <h2 className="card-title" style={{marginBottom: '16px'}}>Services Offered</h2>
              <div className="tags-wrapper">
                <span className="service-tag">Oil change</span>
                <span className="service-tag">Brake service</span>
                <span className="service-tag">AC repair</span>
                <span className="service-tag">Electrical</span>
                <span className="service-tag">Engine repair</span>
                <span className="service-tag">Full inspection</span>
                <span className="service-tag">Diagnostics</span>
              </div>
              
              <h2 className="card-title" style={{marginTop: '32px', marginBottom: '16px'}}>Car Brands Serviced</h2>
              <div className="tags-wrapper">
                <span className="brand-tag">Toyota</span>
                <span className="brand-tag">BMW</span>
                <span className="brand-tag">Mercedes</span>
                <span className="brand-tag">Kia</span>
                <span className="brand-tag">Hyundai</span>
                <span className="brand-tag">Honda</span>
              </div>

              <div className="price-range">
                <div className="price-info">
                  <h4>Price range (per service)</h4>
                  <p>EGP 150 - 3,500</p>
                </div>
                <div className="price-info" style={{textAlign: 'right'}}>
                  <h4>Spare parts sold?</h4>
                  <p className="spare-parts-toggle">Yes <i className="fa-solid fa-check"></i></p>
                </div>
              </div>
            </div>

            {/* Spare Parts */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Available Spare Parts</h2>
                <Link href="#" className="card-link">View all →</Link>
              </div>
              
              <div className="part-item">
                <div className="part-info">
                  <h4>Air filter</h4>
                  <p>AF-1042 • Toyota, Kia • In stock: 24</p>
                </div>
                <div className="part-action">
                  <div className="part-price">EGP 350</div>
                  <button className="btn-reserve">Reserve</button>
                </div>
              </div>
              <div className="part-item">
                <div className="part-info">
                  <h4>Brake pads (front)</h4>
                  <p>BP-2231 • BMW, Mercedes • Low stock: 3</p>
                </div>
                <div className="part-action">
                  <div className="part-price">EGP 1,200</div>
                  <button className="btn-reserve">Reserve</button>
                </div>
              </div>
              <div className="part-item">
                <div className="part-info">
                  <h4>AC compressor belt</h4>
                  <p>AC-0093 • Hyundai, Kia • In stock: 11</p>
                </div>
                <div className="part-action">
                  <div className="part-price">EGP 480</div>
                  <button className="btn-reserve">Reserve</button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="right-col">
            
            {/* Photos */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Workshop Photos</h2>
                <Link href="#" className="card-link">See all 12 →</Link>
              </div>
              <div className="photos-grid">
                <div className="photo-box c1"><i className="fa-solid fa-car-side"></i></div>
                <div className="photo-box c2"><i className="fa-solid fa-screwdriver"></i></div>
                <div className="photo-box c3"><i className="fa-solid fa-building"></i></div>
                <div className="photo-box c4"><i className="fa-solid fa-wrench"></i></div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Reviews & Ratings</h2>
                <span style={{fontSize: '13px', color: '#6B7280'}}>138 reviews</span>
              </div>
              
              <div className="rating-summary">
                <div className="rating-big">
                  <h2>4.8</h2>
                  <div style={{color: '#F59E0B', fontSize: '14px'}}>
                    <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                  </div>
                  <p style={{fontSize: '12px', color: '#6B7280', marginTop: '4px'}}>Overall</p>
                </div>
                <div className="rating-bars">
                  {[
                    { stars: 5, width: '85%', count: 99 },
                    { stars: 4, width: '20%', count: 28 },
                    { stars: 3, width: '10%', count: 7 },
                    { stars: 2, width: '5%', count: 3 },
                    { stars: 1, width: '2%', count: 1 }
                  ].map(bar => (
                    <div className="bar-row" key={bar.stars}>
                      <span style={{width: '12px'}}>{bar.stars}</span>
                      <div className="bar-bg"><div className="bar-fill" style={{width: bar.width}}></div></div>
                      <span style={{width: '24px', textAlign: 'right'}}>{bar.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review 1 */}
              <div className="review-item">
                <div className="review-header">
                  <div className="reviewer-name">Sara M.</div>
                  <div className="review-date">2 days ago</div>
                </div>
                <div style={{color: '#F59E0B', fontSize: '10px', marginBottom: '8px'}}>
                  <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                </div>
                <p className="review-text">Very professional team! They diagnosed the issue quickly and finished ahead of schedule. Highly recommend for Toyota owners.</p>
                <div className="review-photos">
                  <div className="r-photo"><i className="fa-solid fa-car"></i></div>
                  <div className="r-photo"><i className="fa-solid fa-wrench"></i></div>
                </div>
                <div className="review-reply">
                  <span style={{fontWeight: 600, color: '#111827'}}>AutoCare Nasr City:</span> Thank you Sara! We're glad we could help.
                </div>
              </div>

              {/* Review 2 */}
              <div className="review-item">
                <div className="review-header">
                  <div className="reviewer-name">Khaled T.</div>
                  <div className="review-date">1 week ago</div>
                </div>
                <div style={{color: '#F59E0B', fontSize: '10px', marginBottom: '8px'}}>
                  <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-regular fa-star"></i>
                </div>
                <p className="review-text">Good service overall. A bit of a wait but the AC repair was done well and the price was fair.</p>
              </div>

              <button className="btn-load">Load more reviews</button>

              <div className="write-review-box">
                <p><i className="fa-solid fa-pen-to-square"></i> Visited recently? Share your experience to help other car owners.</p>
                <Link href="/reviews/write"><button className="btn-write">Write a review</button></Link>
              </div>

            </div>

          </div>
        </div>
      </div>

      <div className="sticky-footer">
        <div className="footer-info">
          <h4>Ready to book?</h4>
          <p>Next available: Tomorrow, Mon 16 Mar - 09:00</p>
        </div>
        <button className="btn-book-bottom"><i className="fa-solid fa-calendar-check"></i> Book a service</button>
      </div>

    </div>
  );
}
