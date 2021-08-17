import createShadow from '../../shared/create-shadow.js';
import effectInit from '../../shared/effect-init.js';
import effectTarget from '../../shared/effect-target.js';
import effectVirtualTransitionEnd from '../../shared/effect-virtual-transition-end.js';

export default function EffectCreative({ swiper, extendParams, on }) {
  extendParams({
    creativeEffect: {
      transformEl: null,
      limitProgress: 1,
      perspective: true,
      prev: {
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        opacity: 1,
        scale: 1,
      },
      next: {
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        opacity: 1,
        scale: 1,
      },
    },
  });

  const getTranslateValue = (value) => {
    if (typeof value === 'string') return value;
    return `${value}px`;
  };

  const setTranslate = () => {
    const { slides } = swiper;
    const params = swiper.params.creativeEffect;
    for (let i = 0; i < slides.length; i += 1) {
      const $slideEl = slides.eq(i);
      const slideProgress = $slideEl[0].progress;
      const progress = Math.min(
        Math.max($slideEl[0].progress, -params.limitProgress),
        params.limitProgress,
      );
      const offset = $slideEl[0].swiperSlideOffset;
      const t = [swiper.params.cssMode ? -offset - swiper.translate : -offset, 0, 0];
      const r = [0, 0, 0];
      let custom = false;
      if (!swiper.isHorizontal()) {
        t[1] = t[0];
        t[0] = 0;
      }
      let data = {
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        scale: 1,
        opacity: 1,
      };
      if (progress < 0) {
        data = params.next;
        custom = true;
      } else if (progress > 0) {
        data = params.prev;
        custom = true;
      }
      // set translate
      t.forEach((value, index) => {
        t[index] = `calc(${value}px + (${getTranslateValue(data.translate[index])} * ${Math.abs(
          progress,
        )}))`;
      });
      // set rotates
      r.forEach((value, index) => {
        r[index] = data.rotate[index] * Math.abs(progress);
      });

      $slideEl[0].style.zIndex = -Math.abs(Math.round(slideProgress)) + slides.length;

      const translateString = t.join(', ');
      const rotateString = `rotateX(${r[0]}deg) rotateY(${r[1]}deg) rotateZ(${r[2]}deg)`;
      const scaleString =
        progress < 0
          ? `scale(${1 + (1 - data.scale) * progress})`
          : `scale(${1 - (1 - data.scale) * progress})`;
      const opacityString =
        progress < 0 ? 1 + (1 - data.opacity) * progress : 1 - (1 - data.opacity) * progress;
      const transform = `translate3d(${translateString}) ${rotateString} ${scaleString}`;

      // Set shadows
      if ((custom && data.shadow) || !custom) {
        let $shadowEl = $slideEl.children('.swiper-slide-shadow');
        if ($shadowEl.length === 0 && data.shadow) {
          $shadowEl = createShadow(params, $slideEl);
        }
        if ($shadowEl.length) {
          $shadowEl[0].style.opacity = Math.min(Math.max(Math.abs(progress), 0), 1);
        }
      }

      const $targetEl = effectTarget(params, $slideEl);
      $targetEl.transform(transform).css({ opacity: opacityString });
      if (data.origin) {
        $targetEl.css('transform-origin', data.origin);
      }
    }
  };

  const setTransition = (duration) => {
    const { transformEl } = swiper.params.creativeEffect;
    const $transitionElements = transformEl ? swiper.slides.find(transformEl) : swiper.slides;
    $transitionElements.transition(duration).find('.swiper-slide-shadow').transition(duration);

    effectVirtualTransitionEnd({ swiper, duration, transformEl });
  };

  effectInit({
    effect: 'creative',
    swiper,
    on,
    setTranslate,
    setTransition,
    perspective: () => swiper.params.creativeEffect.perspective,
    overwriteParams: () => ({
      watchSlidesProgress: true,
      virtualTranslate: !swiper.params.cssMode,
    }),
  });
}
