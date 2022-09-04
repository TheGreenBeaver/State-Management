declare module '*.module.scss' {
  type Styles = {
    [className: string]: string
  };
  const styles: Styles;
  export default styles;
}