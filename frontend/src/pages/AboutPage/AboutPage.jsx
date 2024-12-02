import React from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import "./AboutPage.css"

const AboutPage = () => {
    return (
        <Container className="aboutPage">
            <h1 className="text-center my-4">About BIAS BUSTERS</h1>

            <Row className="container-about">
                <Col className="col-container">
                    <h2 class="paragraph-like">
                        We are proud to announce the launch of a new tool that helps engineers identify and address bias in CashApp's machine-learning models. In an effort to promote fairness and equity, we focused on providing clear, actionable insights into gender, race, and other demographic disparities, ensuring automated decisions are fair across the board.
                    </h2>

                    <h3 className="key-features">Key Features:</h3>

                    <Card className="my-3">
                        <Card.Body>
                            <Card.Title>1. Bias and Accuracy Measurement</Card.Title>
                            <Card.Text>
                                Using the user’s tree-based ML model along with an open-sourced fairness assessment framework, Fairlearn, we implemented a system to measure bias in the user’s model when trained on their inputted datasets. The datasets are automatically processed and sorted by relevant demographics by our tool.
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <Card className="my-3">
                        <Card.Body>
                            <Card.Title>2. Visualization</Card.Title>
                            <Card.Text>
                                Graphs will be generated based on the user’s choice of demographics on the platform and plotted against each other, demonstrating the possible inaccuracies in bias measurement. An interactive slider was implemented, coloring certain plots red and green, to give the user an understanding of which combinations of demographics are subject to biased decisions executed by their model.
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <Card className="my-3">
                        <Card.Body>
                            <Card.Title>3. Static Data Testing</Card.Title>
                            <Card.Text>
                                We have generated a static dataset of 10,000 lines for the user to test their ML model on after training. This feature allows the user to upload several models to be tested on our dataset against Fairlearn to demonstrate specific biases within their models.
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <h4 class="paragraph-like">
                        Our feedback so far has been great, and our product has demonstrated to the engineers at CashApp that there are vast and quick ways, like our product, to tackle the problem of machine-learning bias in today’s world.
                    </h4>
                </Col>
            </Row>

            <footer className="text-center my-4">
                <p>
                    <strong>CashApp BIAS BUSTERS</strong>
                    <br />
                    Press Release - 7 November, 2024
                </p>
            </footer>
        </Container>
    );
};

export default AboutPage;
