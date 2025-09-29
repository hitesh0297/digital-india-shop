import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
const Footer = () => {
  return (
    <footer className="position-fixed bottom-0 start-0 end-0 bg-dark">
      <Container>
        <Row>
          <Col className="text-center py-3" style={{"color": "rgba(255, 255, 255, 0.55)"}} > Copyright &copy; Hitesh Sharma</Col>
        </Row>
      </Container>
    </footer>
  )
}
export default Footer
