import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glitch-panel">
          <div className="glitch-egg">&#9671;</div>
          <p>THE PET GLITCHED</p>
          <p className="glitch-sub">Something went wrong rendering this pet.</p>
          <button className="share-btn" onClick={this.handleReset}>TRY AGAIN</button>
        </div>
      )
    }
    return this.props.children
  }
}
