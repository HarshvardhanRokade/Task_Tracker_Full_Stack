import { Component } from 'react'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="flex flex-col items-center justify-center
                               min-h-64 p-8 rounded-2xl border text-center"
                    style={{
                        backgroundColor: 'var(--surface-base)',
                        borderColor: 'var(--danger-red)',
                    }}>
                    <div className="text-4xl mb-3">⚠️</div>
                    <h3 className="text-lg font-bold mb-2"
                        style={{ color: 'var(--text-primary)' }}>
                        Something went wrong
                    </h3>
                    <p className="text-sm mb-4"
                       style={{ color: 'var(--text-secondary)' }}>
                        This section failed to load. Your data is safe.
                    </p>
                    <button
                        onClick={() => this.setState({
                            hasError: false, error: null
                        })}
                        className="px-4 py-2 rounded-lg text-sm font-bold"
                        style={{
                            backgroundColor: 'var(--surface-raised)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)',
                        }}>
                        Try Again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary