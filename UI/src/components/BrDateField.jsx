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

// 숫자 8자리 → yyyy-mm-dd 포맷
function formatDateStr(val) {
  const digits = (val || '').replace(/\D/g, '').slice(0, 8)
  if (digits.length > 6) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
  if (digits.length > 4) return `${digits.slice(0, 4)}-${digits.slice(4)}`
  return digits
}

export const makeBrDateFieldProps = propsFactory({
  autofocus: Boolean,
  placeholder: String,
  persistentPlaceholder: Boolean,
  role: String,
  type: {
    type: String,
    default: 'text',
  },
  modelModifiers: Object,

  ...makeVInputProps(),
  ...makeVFieldProps(),
  variant: {
    type: String,
    default: 'outlined',
  },
}, 'BrDateField')

export default genericComponent()({
  name: 'BrDateField',

  directives: { Intersect },

  inheritAttrs: false,

  props: makeBrDateFieldProps(),

  emits: {
    'click:control': (e) => true,
    'mousedown:control': (e) => true,
    'update:focused': (focused) => true,
    'update:modelValue': (val) => true,
  },

  setup(props, { attrs, emit, slots }) {
    const model = useProxiedModel(props, 'modelValue')
    const _inputValue = ref(model.value || '')

    watch(model, (val) => {
      _inputValue.value = val || ''
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
      if (inputRef.value !== document.activeElement) inputRef.value?.focus()
      if (!isFocused.value) focus()
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
      const formatted = formatDateStr(el.value)
      el.value = formatted
      _inputValue.value = formatted
      model.value = formatted.length === 10 ? formatted : null
      nextTick(() => {
        el.selectionStart = formatted.length
        el.selectionEnd = formatted.length
      })
    }

    function onInput(e) {
      applyFormat(e.target)
    }

    function onBeforeInput(e) {
      if (e.data && !/^\d+$/.test(e.data)) e.preventDefault()
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
                        inputmode="numeric"
                        maxlength="10"
                        autocomplete="off"
                        onFocus={onFocus}
                        onBlur={blur}
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
