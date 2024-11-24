import React from 'react';
import { MDBFooter, MDBContainer, MDBBtn } from 'mdb-react-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons'; // Only GitHub icon
import { Link } from 'react-router-dom'; // To create the About Us link
import './Footer.css'

function Footer() {
    return (
        <MDBFooter
            className="text-center"
            style={{
                backgroundColor: '#343a40', // Consistent dark background
                color: 'white', // Text color
            }}
        >
            <MDBContainer className="custom-footer-container">
                {/* Social Media Links and About Us Section */}
                <section aria-label='github link' className="mb-4 d-flex justify-content-center align-items-center">
                    {/* About Us Link */}
                    <Link
                        to="/about"
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            marginRight: '15px' // Space between the link and the GitHub icon
                        }}
                    >
                        About Us
                    </Link>

                    {/* GitHub Icon */}
                    <MDBBtn
                        outline
                        color="light"
                        floating
                        className="m-1"
                        href="https://github.com/Jai0212/Cash-App-Bias-Busters"
                        role="button"
                        aria-label='github link'
                    >
                        <FontAwesomeIcon icon={faGithub} />
                    </MDBBtn>
                </section>

                {/* Description Section */}
                <section className="mb-4">
                    <p>
                        Bias Busters aims to create awareness and reduce biases in decision-making through innovative solutions. Join us in making a difference.
                    </p>
                </section>

                {/* Quote Section */}
                <section className="mb-4">
                    <blockquote style={{ fontStyle: 'italic', color: '#ccc' }}>
                        "The greatest weapon against stress is our ability to choose one thought over another."
                    </blockquote>
                    <p>- William James</p>
                </section>
            </MDBContainer>

            {/* Footer Bottom */}
            <div
                className="text-center p-3"
                style={{
                    backgroundColor: '#23272b', // Dark footer bottom
                    color: 'white',
                }}
            >
                © 2024 Copyright: Bias Busters
            </div>
        </MDBFooter>
    );
}

export default Footer;
