// Styles
//import 'vuetify/lib/VTextField/VTextField.sass'

// Components
import { VCounter } from 'vuetify/components/VCounter'
import { filterFieldProps, makeVFieldProps, VField } from 'vuetify/lib/components/VField/VField.mjs'
import { makeVInputProps, VInput } from 'vuetify/lib/components/VInput/VInput.mjs'
import { phoneFormatter, setCursor } from '../util/fmt';

// Composables
import { useFocus } from 'vuetify/lib/composables/focus'
import { forwardRefs } from 'vuetify/lib/composables/forwardRefs'
import { useProxiedModel } from 'vuetify/lib/composables/proxiedModel'

// Directives
import Intersect from 'vuetify/lib/directives/intersect/index.mjs'

// Utilities
import { cloneVNode, computed, nextTick, ref, toRaw, watch } from 'vue'
import { getCurrentInstance, toKebabCase, callEvent, filterInputAttrs, genericComponent, propsFactory, useRender } from 'vuetify/lib/util/index.mjs'



const activeTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month']

export const makeBrPhoneNoFieldProps = propsFactory({
  autofocus: Boolean,
  counter: [Boolean, Number, String],
  counterValue: [Number, Function],
  prefix: String,
  placeholder: String,
  persistentPlaceholder: Boolean,
  persistentCounter: Boolean,
  suffix: String,
  role: String,
  type: {
    type: String,
    default: 'text',
  },
  modelModifiers: Object,

  ...makeVInputProps(),
  ...makeVFieldProps(),
}, 'BrPhoneNoField')


export default genericComponent()({
  name: 'BrPhoneNoField',

  directives: { Intersect },

  inheritAttrs: false,

  props: makeBrPhoneNoFieldProps(),

  emits: {
    'click:control': (e) => true,
    'mousedown:control': (e) => true,
    'update:focused': (focused) => true,
    'update:modelValue': (val) => true,
  },

  setup (props, { attrs, emit, slots }) {

    const model = useProxiedModel(props, 'modelValue', props.modelValue)

    //console.log("==========", model.value, props, toRaw(props.modelValue));
    const _inputValue = ref(phoneFormatter(model.value, null, true));

    const inputValue = computed({
      get: () => {
        return _inputValue.value;
      },
      set: (val) => {        
        if ( val && val.length ) {
          model.value = val.replace(/\-/gm, "");
          _inputValue.value = phoneFormatter(val, null, true);

        } else if (val == null || val.length == 0 ) {
          _inputValue.value = null;
          model.value = null;
        }
        //console.log("search set", val, _inputValue.value, model.value);
      },
    });

    watch(model, (val) => {
      _inputValue.value = phoneFormatter(val, null, true);
    });

    const { isFocused, focus, blur } = useFocus(props)
    const counterValue = computed(() => {
      return typeof props.counterValue === 'function' ? props.counterValue(model.value)
        : typeof props.counterValue === 'number' ? props.counterValue
        : (model.value ?? '').toString().length
    })

    const max = computed(() => {
      if (attrs.maxlength) return attrs.maxlength

      if (
        !props.counter ||
        (typeof props.counter !== 'number' &&
        typeof props.counter !== 'string')
      ) return undefined

      return props.counter
    })

    const isPlainOrUnderlined = computed(() => ['plain', 'underlined'].includes(props.variant))

    function onIntersect (
      isIntersecting,
      entries
    ) {
      if (!props.autofocus || !isIntersecting) return

      (entries[0].target)?.focus?.()
    }

    const vInputRef = ref()
    const vFieldRef = ref()
    const inputRef = ref()
    const isActive = computed(() => (
      activeTypes.includes(props.type) ||
      props.persistentPlaceholder ||
      isFocused.value ||
      props.active
    ));

    function onFocus () {
      if (inputRef.value !== document.activeElement) {
        inputRef.value?.focus()
      }
      if (!isFocused.value) focus();

    }

    function onControlMousedown (e) {
      emit('mousedown:control', e)

      if (e.target === inputRef.value) return

      onFocus()
      e.preventDefault()
    }
    function onControlClick (e) {
      onFocus()

      emit('click:control', e)
    }
    function onClear (e) {
      e.stopPropagation()

      onFocus()

      nextTick(() => {
        model.value = null

        callEvent(props['onClick:clear'], e)
      })
    }
    function onInput (e) {
      const el = e.target;
      let fmtValue = phoneFormatter(el.value, null, true);

      let isSelectPosEqual = el.selectionStart == el.selectionEnd;
      let isSelectPosLast = false;
      if ( el.value && el.value.length ) {
        isSelectPosLast = el.value.length == el.selectionEnd;
      }
      el.value = fmtValue;
      inputValue.value = el.value;

      e.preventDefault();

      let startSelect = el.selectionStart;
      let endSelect = el.selectionEnd;
      if ( isSelectPosEqual && isSelectPosLast ) {
        let tmpPositionFromEnd = fmtValue ? fmtValue.length : 0;
        tmpPositionFromEnd = Math.max(tmpPositionFromEnd, el.selectionEnd);
        startSelect = tmpPositionFromEnd;
        endSelect = tmpPositionFromEnd;
      }
      const caretPosition = [startSelect, endSelect]

      nextTick(() => {
        el.selectionStart = caretPosition[0]
        el.selectionEnd = caretPosition[1]
      })
      
    }

    useRender(() => {
      const hasCounter = !!(slots.counter || (props.counter !== false && props.counter != null))
      const hasDetails = !!(hasCounter || slots.details)
      const [rootAttrs, inputAttrs] = filterInputAttrs(attrs)
      const { modelValue: _, ...inputProps } = VInput.filterProps(props)
      const fieldProps = filterFieldProps(props)

      return (
        <VInput
          ref={ vInputRef }
          v-model={ model.value }
          class={[
            'v-text-field',
            {
              'v-text-field--prefixed': props.prefix,
              'v-text-field--suffixed': props.suffix,
              'v-input--plain-underlined': isPlainOrUnderlined.value,
            },
            props.class,
          ]}
          style={ props.style }
          { ...rootAttrs }
          { ...inputProps }
          centerAffix={ !isPlainOrUnderlined.value }
          focused={ isFocused.value }
        >
          {{
            ...slots,
            default: ({
              id,
              isDisabled,
              isDirty,
              isReadonly,
              isValid,
            }) => (
              <VField
                ref={ vFieldRef }
                onMousedown={ onControlMousedown }
                onClick={ onControlClick }
                onClick:clear={ onClear }
                onClick:prependInner={ props['onClick:prependInner'] }
                onClick:appendInner={ props['onClick:appendInner'] }
                role={ props.role }
                { ...fieldProps }
                id={ id.value }
                active={ isActive.value || isDirty.value }
                dirty={ isDirty.value || props.dirty }
                disabled={ isDisabled.value }
                focused={ isFocused.value }
                error={ isValid.value === false }
              >
                {{
                  ...slots,
                  default: ({
                    props: { class: fieldClass, ...slotProps },
                  }) => {
                    const inputNode = (
                      <input
                        ref={ inputRef }
                        value={ inputValue.value }
                        onInput={ onInput }
                        v-intersect={[{
                          handler: onIntersect,
                        }, null, ['once']]}
                        autofocus={ props.autofocus }
                        readonly={ isReadonly.value }
                        disabled={ isDisabled.value }
                        name={ props.name }
                        placeholder={ props.placeholder }
                        size={ 1 }
                        type={ props.type }
                        onFocus={ onFocus }
                        onBlur={ blur }
                        { ...slotProps }
                        { ...inputAttrs }
                      />
                    )

                    return (
                      <>
                        { props.prefix && (
                          <span class="v-text-field__prefix">
                            <span class="v-text-field__prefix__text">
                              { props.prefix }
                            </span>
                          </span>
                        )}

                        { slots.default ? (
                          <div
                            class={ fieldClass }
                            data-no-activator=""
                          >
                            { slots.default() }
                            { inputNode }
                          </div>
                        ) : cloneVNode(inputNode, { class: fieldClass })}

                        { props.suffix && (
                          <span class="v-text-field__suffix">
                            <span class="v-text-field__suffix__text">
                              { props.suffix }
                            </span>
                          </span>
                        )}
                      </>
                    )
                  },
                }}
              </VField>
            ),
            details: hasDetails ? slotProps => (
              <>
                { slots.details?.(slotProps) }

                { hasCounter && (
                  <>
                    <span />

                    <VCounter
                      active={ props.persistentCounter || isFocused.value }
                      value={ counterValue.value }
                      max={ max.value }
                      v-slots:default={ slots.counter }
                    />
                  </>
                )}
              </>
            ) : undefined,
          }}
        </VInput>
      )
    })

    return forwardRefs({}, vInputRef, vFieldRef, inputRef)
  },
})
