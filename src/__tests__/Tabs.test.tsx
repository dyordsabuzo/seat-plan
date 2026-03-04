import { fireEvent, render } from '@testing-library/react'
import Tabs, { TabItem } from '../components/ui/Tabs'

describe('Tabs', () => {
  const items: TabItem[] = [
    { key: 'one', label: 'One' },
    { key: 'two', label: 'Two' }
  ]

  it('renders and responds to clicks', () => {
    const onChange = jest.fn()
    const { getByText } = render(<Tabs items={items} activeKey="one" onChange={onChange} />)
    fireEvent.click(getByText('Two'))
    expect(onChange).toHaveBeenCalledWith('two')
  })

  it('handles arrow key navigation', () => {
    const onChange = jest.fn()
    const { getByText } = render(<Tabs items={items} activeKey="one" onChange={onChange} />)
    const first = getByText('One')
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('two')
    fireEvent.keyDown(getByText('Two'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenCalledWith('one')
  })
})
