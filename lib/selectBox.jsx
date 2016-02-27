import React from 'react'

var div = React.createElement.bind(null, 'div')
var button = React.createElement.bind(null, 'button')
var a = React.createElement.bind(null, 'a')
var select = React.createElement.bind(null, 'select')
var option = React.createElement.bind(null ,'option')
var label = React.createElement.bind(null, 'label')
var idInc = 0
var keyHandlers = {
    38: 'handleUpKey',
    40: 'handleDownKey',
    32: 'handleSpaceKey',
    13: 'handleEnterKey',
    27: 'handleEscKey',
    74: 'handleDownKey',
    75: 'handleUpKey'
}


class SelectBox extends React.Component {

    constructor() {
        super()
        this.clickingOption = false
        this.blurTimeout = null
        this.state = {
            id: 'react-select-box-' + (++idInc),
            open: false,
            focusedIndex: -1,
            pendingValue: []
        }

        this.interceptEvent = this.interceptEvent.bind(this)
        this.changeOnClose = this.changeOnClose.bind(this)
        this.updatePendingValue = this.updatePendingValue.bind(this)
        this.handleFocus = this.handleFocus.bind(this)
        this.handleBlur = this.handleBlur.bind(this)
        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleNativeChange = this.handleNativeChange.bind(this)
        this.handleClear = this.handleClear.bind(this)
        this.toggleOpenClose = this.toggleOpenClose.bind(this)
        this.handleOpen = this.handleOpen.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.moveFocus = this.moveFocus.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleDownKey = this.handleDownKey.bind(this)
        this.handleEnterKey = this.handleEnterKey.bind(this)
        this.handleEscKey = this.handleEscKey.bind(this)
        this.handleSpaceKey = this.handleSpaceKey.bind(this)
        this.handleUpKey = this.handleUpKey.bind(this)


    }

    // lifecycle methods
    componentWillMount() {
        this.updatePendingValue(this.props.value)
    }

    componentWillReceiveProps(next) {
        this.updatePendingValue(next.value)
    }

    // event handlers
    interceptEvent(event) {
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    changeOnClose() {
        return this.isMultiple() && String(this.props.changeOnClose) === 'true'
    }

    updatePendingValue(value, cb) {
        if (this.changeOnClose()) {
            this.setState({pendingValue: value}, cb)
            return true
        }
        return false
    }

    handleFocus() {
        clearTimeout(this.blurTimeout)
    }

    handleBlur() {
        clearTimeout(this.blurTimeout)
        this.blurTimeout = setTimeout(this.handleClose, 0)
    }

    handleMouseDown() {
        this.clickingOption = true
    }

    handleChange(val, cb) {
        return function (event) {
            this.clickingOption = false
            this.interceptEvent(event)
            if (this.isMultiple()) {
                var selected = []
                if (val != null) {
                    selected = this.value().slice(0)
                    var index = selected.indexOf(val)
                    if (index !== -1) {
                        selected.splice(index, 1)
                    } else {
                        selected.push(val)
                    }
                }
                this.updatePendingValue(selected, cb) || this.props.onChange(selected)
            } else {
                this.updatePendingValue(val, cb) || this.props.onChange(val)
                this.handleClose()
                this.refs.button.getDOMNode().focus()
            }
        }.bind(this)
    }

    handleNativeChange(event) {
        var val = event.target.value
        if (this.isMultiple()) {
            var children = [].slice.call(event.target.childNodes, 0)
            val = children.reduce(function (memo, child) {
                if (child.selected) {
                    memo.push(child.value)
                }
                return memo
            }, [])
        }
        this.props.onChange(val)
    }

    handleClear(event) {
        this.interceptEvent(event)
        this.handleChange(null, function () {
            // only called when change="true"
            this.props.onChange(this.state.pendingValue)
        })(event)
    }

    toggleOpenClose(event) {
        this.interceptEvent(event)
        this.setState({open: !this.state.open});
        if(this.state.open) {
            return this.setState({open: false})
        }

        this.handleOpen()
    }

    handleOpen(event) {
        this.interceptEvent(event)
        this.setState({open: true}, function () {
            this.refs.menu.focus()
        })
    }

    handleClose(event) {
        this.interceptEvent(event)
        if(!this.clickingOption) {
            this.setState({open: false, focusedIndex: -1})
        }
        if (this.changeOnClose()) {
            this.props.onChange(this.state.pendingValue)
        }
    }

    moveFocus(move) {
        var len = React.Children.count(this.props.children)
        var idx = (this.state.focusedIndex + move + len) % len
        this.setState({focusedIndex: idx})
    }

    handleKeyDown(event) {
        if (keyHandlers[event.which]) {
            this[keyHandlers[event.which]](event)
        }
    }

    handleUpKey(event) {
        this.interceptEvent(event)
        this.moveFocus(-1)
    }

    handleDownKey(event) {
        this.interceptEvent(event)
        if (!this.state.open) {
            this.handleOpen(event)
        }
        this.moveFocus(1)
    }

    handleSpaceKey(event) {
        this.interceptEvent(event)
        if (!this.state.open) {
            this.handleOpen(event)
        } else if (this.state.focusedIndex !== -1) {
            this.handleEnterKey()
        }
    }

    handleEnterKey(event) {
        if (this.state.focusedIndex !== -1) {
            this.handleChange(this.options()[this.state.focusedIndex].value)(event)
        }
    }

    handleEscKey(event) {
        if (this.state.open) {
            this.handleClose(event)
        } else {
            this.handleClear(event)
        }
    }

    // rendering methods

    label() {
        var selected = this.options()
            .filter(function (option) {
                return this.isSelected(option.value)
            }.bind(this))
            .map(function (option) {
                return option.label
            })
        return selected.length > 0 ? selected.join(', ') : this.props.label
    }

    isMultiple() {
        return String(this.props.multiple) === 'true'
    }

    options() {
        var options = []
        React.Children.forEach(this.props.children, function (option) {
            options.push({
                value: option.props.value,
                label: option.props.children
            })
        })
        return options
    }

    value() {
        var value = this.changeOnClose() ?
            this.state.pendingValue :
            this.props.value

        if (!this.isMultiple() || Array.isArray(value)) {
            return value
        }

        if (value != null) {
            return [value]
        }
        return []
    }

    hasValue() {
        if (this.isMultiple()) {
            return this.value().length > 0
        }
        return this.value() != null
    }

    isSelected(value) {
        if (this.isMultiple()) {
            return this.value().indexOf(value) !== -1
        }
        return this.value() === value
    }

    render() {
        var className = 'react-select-box-container'
        if (this.props.className) {
            className += ' ' + this.props.className
        }
        if (this.isMultiple()) {
            className += ' react-select-box-multi'
        }
        if (!this.hasValue()) {
            className += ' react-select-box-empty'
        }
        return (
            div(
                {
                    onKeyDown: this.handleKeyDown,
                    className: className
                },
                button(
                    {
                        id: this.state.id,
                        ref: 'button',
                        className: 'react-select-box',
                        onClick: this.toggleOpenClose,
                        onBlur: this.handleBlur,
                        tabIndex: '0',
                        'aria-hidden': true
                    },
                    div({className: 'react-select-box-label'}, this.label())
                ),
                this.renderOptionMenu(),
                this.renderClearButton(),
                this.renderNativeSelect()
            )
        )
    }

    renderNativeSelect() {
        var id = this.state.id + '-native-select'
        var multiple = this.isMultiple()
        var empty = multiple ? null : option({key: '', value: ''}, 'No Selection')
        var options = [empty].concat(this.props.children)
        return div(
            {className: 'react-select-box-native'},
            label({htmlFor: id}, this.props.label),
            select({
                id: id,
                multiple: multiple,
                onKeyDown: function (e) { e.stopPropagation() },
                value: this.props.value || (multiple ? [] : ''),
                onChange: this.handleNativeChange
            }, options)
        )

    }

    renderOptionMenu() {
        var renderOption = (option, i) => {
            var className = 'react-select-box-option'
            if (i === this.state.focusedIndex) {
                className += ' react-select-box-option-focused'
            }
            if (this.isSelected(option.value)) {
                className += ' react-select-box-option-selected'
            }
            return a(
                {
                    id: this.state.id + '-' + i,
                    href: '#',
                    onClick: this.handleChange(option.value),
                    onMouseDown: this.handleMouseDown,
                    className: className,
                    tabIndex: -1,
                    key: option.value,
                    onBlur: this.handleBlur,
                    onFocus: this.handleFocus
                },
                option.label
            )
        }

        var className = 'react-select-box-options'
        if (!this.state.open) {
            className += ' react-select-box-hidden'
        }
        return div(
            {
                className: className,
                onBlur: this.handleBlur,
                onFocus: this.handleFocus,
                'aria-hidden': true,
                ref: 'menu',
                tabIndex: 0
            },
            div(
                {
                    className: 'react-select-box-off-screen'
                },
                this.options().map(renderOption)
            ),
            this.renderCloseButton()
        )
    }

    renderClearButton() {
        if (this.hasValue()) {
            return button({
                'aria-label': this.props.clearText,
                className: 'react-select-box-clear',
                onClick: this.handleClear
            })
        }
    }

    renderCloseButton() {
        if (this.isMultiple() && this.props.closeText) {
            return button(
                {
                    onClick: this.handleClose,
                    className: 'react-select-box-close',
                    onBlur: this.handleBlur,
                    onFocus: this.handleFocus
                },
                this.props.closeText
            )
        }
    }
}

SelectBox.defaultProps = {
    closeText: 'Close',
    clearText: 'Remove selection'
}

export default SelectBox