import { forwardRef } from "preact/compat"
import { mergeStyles } from "$styles/helpers/mergeStyles"
import defaultStyles from "./style.module.css"

export const InfoButton = forwardRef(({ onClick, styles }, ref) => {
  styles = mergeStyles({ ...defaultStyles }, styles)

  return (
    <button ref={ref} class={styles.button} onClick={onClick}>
      <svg
        class={styles.svg}
        viewBox="0 0 5 13"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m3.72905 10.8229v.5256c-.11944.0955-.28666.1672-.45388.2628-.16723.0716-.35834.1433-.54945.215-.19111.0716-.38222.1194-.57333.1433s-.38222.0478-.54945.0478c-.38222 0-.621109-.0717-.764442-.215-.167222-.1434-.238889-.3106-.238889-.4778 0-.1911.023889-.3822.047778-.5733s.071667-.3823.119445-.6211l1.003328-4.56282-.931662-.215v-.50167c.143333-.04777.334442-.11944.597222-.19111.23889-.07166.50167-.11944.78833-.16722.28667-.04778.54945-.09556.81223-.11944.26277-.02389.50166-.04778.71666-.04778l.26278.16722-1.33778 6.33052zm.45389-8.02663c-.215.19111-.52555.28667-.88389.28667-.33444 0-.62111-.09556-.86-.28667-.215-.19111-.33444-.43-.33444-.74056 0-.33444.11944-.59722.33444-.78833s.50167-.286667.86-.286667c.38223 0 .66889.095557.88389.286667s.33445.45389.33445.78833c-.02389.31056-.11945.54945-.33445.74056z" />
      </svg>
    </button>
  )
})
