import { formatDistanceToNow } from 'date-fns'

const formatDate = date => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true
  })
}

export default formatDate
