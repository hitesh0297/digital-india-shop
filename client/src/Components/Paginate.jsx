import React from 'react'
import { Pagination } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

const Paginate = ({ pages = 1, page = 1, keyword = '', role = 'customer' }) => {
  if (pages <= 1) return null
  const items = []
  for (let x = 1; x <= pages; x++) {
    let to
    if (role == 'admin') {
      to = `/admin/productlist/${x}`
    } else if (keyword) {
      to = `/search/${keyword}/page/${x}`
    } else {
      to = `/page/${x}`
    }
    items.push(
      <LinkContainer key={x} to={to}>
        <Pagination.Item active={x === Number(page)}>{x}</Pagination.Item>
      </LinkContainer>
    )
  }
  return <Pagination className="justify-content-center mt-3">{items}</Pagination>
}
export default Paginate
