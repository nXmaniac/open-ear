import { Observable } from 'rxjs';
import MatchersUtil = jasmine.MatchersUtil;
import CustomEqualityTester = jasmine.CustomEqualityTester;
import CustomMatcherResult = jasmine.CustomMatcherResult;
import CustomMatcher = jasmine.CustomMatcher;
import { ObservableSpy } from '../observable-spy';
import { compareEquality } from '../../../../testing-utility/jasmine/custom-matchers/utility';

declare global {
  namespace jasmine {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface ObservableMatchers<G> extends jasmine.Matchers<any> {
      toHaveLastEmitted(value: G): boolean;
    }
  }
}

export function toHaveLastEmitted<G>(util: MatchersUtil, customEqualityTester: CustomEqualityTester[]): CustomMatcher {
  return {
    compare: function(actual: Observable<G>, expected: G): CustomMatcherResult {
      const observableSpy = ObservableSpy.getSpy(actual);
      const mostRecentCall = observableSpy.spy.calls.mostRecent();
      if (!mostRecentCall) {
        return {
          pass: false,
          message: 'Expected observable to emit but it never emitted',
        };
      }
      const actualEmission = mostRecentCall.args[0];
      return compareEquality(
        util,
        expected,
        actualEmission,
        `Expected observable to have last emitted:
        ${util.pp(expected)}
        but actual emission was:
        ${util.pp(actualEmission)}\n\n`,
      );
    },
  };
}
