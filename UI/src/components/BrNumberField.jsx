import { VField } from 'vuetify/components/VField'
import { makeVFieldProps } from 'vuetify/lib/components/VField/VField'
import { VInput } from 'vuetify/components/VInput'
import { makeVInputProps } from 'vuetify/lib/components/VInput/VInput'

import { useFocus } from 'vuetify/lib/composables/focus'
import { forwardRefs } from 'vuetify/lib/composables/forwardRefs'
import { useProxiedModel } from 'vuetify/lib/composables/proxiedModel'

import Intersect from 'vuetify/lib/directives/intersect/index.mjs'

import { cloneVNode, computed, nextTick, ref, watch } from 'vue'
import { callEvent, filterInputAttrs, genericComponent, propsFactory, useRender } from 'vuetify/lib/util/index.mjs'

import { edit_number_format, unformat_number_to_str } from '../util/fmt'

export const makeBrNumberFieldProps = propsFactory({
  autofocus: Boolean,
  placeholder: String,
  persistentPlaceholder: Boolean,
  allowDecimal: {
    type: Boolean,
    default: false,
  },
  maxDigits: {
    type: Number,
    default: 15,
  },
  role: String,
  type: {
    type: String,
    default: 'text',
  },
  modelModifiers: Object,
  numberOptions: Object,

  ...makeVInputProps(),
  ...makeVFieldProps(),
  variant: {
    type: String,
    default: 'outlined',
  },
}, 'BrNumberField')

export default genericComponent()({
  name: 'BrNumberField',

  directives: { Intersect },

  inheritAttrs: false,

  props: makeBrNumberFieldProps(),

  emits: {
    'click:control': (e) => true,
    'mousedown:control': (e) => true,
    'update:focused': (focused) => true,
    'update:modelValue': (val) => true,
  },

  setup(props, { attrs, emit, slots }) {
    const model = useProxiedModel(props, 'modelValue')
    const numberOptions = Object.assign(
      { precision: props.allowDecimal ? 2 : 0 },
      props.numberOptions || {}
    )
    const _inputValue = ref(model.value != null ? edit_number_format(model.value, numberOptions) || '' : '')

    let modelInnerChanged = false
    watch(model, (val) => {
      if (!modelInnerChanged) {
        _inputValue.value = val != null ? (edit_number_format(val, numberOptions) || '') : ''
      }
      modelInnerChanged = false
    })

    const { isFocused, focus, blur } = useFocus(props)

    const isPlainOrUnderlined = computed(() => ['plain', 'underlined'].includes(props.variant))

    const vInputRef = ref()
    const vFieldRef = ref()
    const inputRef = ref()

    const activeTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month']
    const isActive = computed(() =>
      activeTypes.includes(props.type) ||
      props.persistentPlaceholder ||
      isFocused.value ||
      props.active
    )

    function onIntersect(isIntersecting, entries) {
      if (!props.autofocus || !isIntersecting) return
      entries[0].target?.focus?.()
    }

    function onFocus() {
      if (model.value != null) {
        const editFmt = edit_number_format(model.value, numberOptions, 'editing') || ''
        _inputValue.value = editFmt
        if (inputRef.value) inputRef.value.value = editFmt
      }
      if (inputRef.value !== document.activeElement) inputRef.value?.focus()
      if (!isFocused.value) focus()
    }

    function onBlur() {
      if (model.value != null) {
        const displayFmt = edit_number_format(model.value, numberOptions) || ''
        _inputValue.value = displayFmt
        if (inputRef.value) inputRef.value.value = displayFmt
      }
      blur()
    }

    function onControlMousedown(e) {
      emit('mousedown:control', e)
      if (e.target === inputRef.value) return
      onFocus()
      e.preventDefault()
    }

    function onControlClick(e) {
      onFocus()
      emit('click:control', e)
    }

    function onClear(e) {
      e.stopPropagation()
      onFocus()
      nextTick(() => {
        model.value = null
        _inputValue.value = ''
        callEvent(props['onClick:clear'], e)
      })
    }

    function applyFormat(el) {
      const cursorPos = el.selectionStart
      const oldValue = el.value
      const wasAtEnd = cursorPos >= oldValue.length

      const formatted = edit_number_format(el.value, numberOptions, 'editing') || ''
      el.value = formatted
      _inputValue.value = formatted
      const numStr = unformat_number_to_str(formatted)
      modelInnerChanged = true
      model.value = (numStr != null && numStr !== '') ? Number(numStr) : null

      nextTick(() => {
        if (wasAtEnd) {
          el.selectionStart = formatted.length
          el.selectionEnd = formatted.length
        } else {
          const digitsBeforeCursor = oldValue.slice(0, cursorPos).replace(/\D/g, '').length
          let newPos = formatted.length
          let counted = 0
          for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) counted++
            if (counted === digitsBeforeCursor) { newPos = i + 1; break }
          }
          el.selectionStart = newPos
          el.selectionEnd = newPos
        }
      })
    }

    function onInput(e) {
      applyFormat(e.target)
    }

    function onBeforeInput(e) {
      if (!e.data) return
      if (!/^\d+$/.test(e.data)) {
        if (props.allowDecimal && e.data === '.') return
        e.preventDefault()
        return
      }
      const currentDigits = (inputRef.value?.value || '').replace(/\D/g, '').length
      if (currentDigits >= props.maxDigits) e.preventDefault()
    }

    useRender(() => {
      const [rootAttrs, inputAttrs] = filterInputAttrs(attrs)
      const { modelValue: _, ...inputProps } = VInput.filterProps(props)

      return (
        <VInput
          ref={vInputRef}
          v-model={model.value}
          class={[
            'v-text-field',
            { 'v-input--plain-underlined': isPlainOrUnderlined.value },
            props.class,
          ]}
          style={props.style}
          {...rootAttrs}
          {...inputProps}
          centerAffix={!isPlainOrUnderlined.value}
          focused={isFocused.value}
        >
          {{
            ...slots,
            default: ({ id, isDisabled, isDirty, isReadonly, isValid }) => (
              <VField
                ref={vFieldRef}
                onMousedown={onControlMousedown}
                onClick={onControlClick}
                onClick:clear={onClear}
                onClick:prependInner={props['onClick:prependInner']}
                onClick:appendInner={props['onClick:appendInner']}
                role={props.role}
                label={props.label}
                variant={props.variant}
                density={props.density}
                appendInnerIcon={props.appendInnerIcon}
                prependInnerIcon={props.prependInnerIcon}
                clearable={props.clearable}
                id={id.value}
                active={isActive.value || isDirty.value}
                dirty={isDirty.value || props.dirty}
                disabled={isDisabled.value}
                focused={isFocused.value}
                error={isValid.value === false}
              >
                {{
                  ...slots,
                  default: ({ props: { class: fieldClass, ...slotProps } }) => {
                    const inputNode = (
                      <input
                        ref={inputRef}
                        value={_inputValue.value}
                        onInput={onInput}
                        onBeforeinput={onBeforeInput}
                        v-intersect={[{ handler: onIntersect }, null, ['once']]}
                        autofocus={props.autofocus}
                        readonly={isReadonly.value}
                        disabled={isDisabled.value}
                        name={props.name}
                        placeholder={props.placeholder}
                        size={1}
                        type={props.type}
                        inputmode="decimal"
                        autocomplete="off"
                        onFocus={onFocus}
                        onBlur={onBlur}
                        style={{ textAlign: 'end' }}
                        {...slotProps}
                        {...inputAttrs}
                      />
                    )

                    return (
                      <>
                        {slots.default
                          ? <div class={fieldClass} data-no-activator="">{slots.default()}{inputNode}</div>
                          : cloneVNode(inputNode, { class: fieldClass })
                        }
                      </>
                    )
                  },
                }}
              </VField>
            ),
          }}
        </VInput>
      )
    })

    return forwardRefs({}, vInputRef, vFieldRef, inputRef)
  },
})
