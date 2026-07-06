const image = /* GraphQL */ `
  fragment image on MediaImage {
    image {
      url
      id
      altText
      width
      height
    }
  }
`

export default image
