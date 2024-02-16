/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AllMozModules } from "mozbuild";

export interface XPCOMUtils {
	/**
	 * Defines a getter on a specified object that will be created upon first use.
	 *
     * @deprecated Use ChromeUtils.defineLazyGetter instead
	 * @param aObject
	 *        The object to define the lazy getter on.
	 * @param aName
	 *        The name of the getter to define on aObject.
	 * @param aLambda
	 *        A function that returns what the getter should return.  This will
	 *        only ever be called once.
	 */
	defineLazyGetter: (
		aObject: object,
		aName: string,
		aLambda: Function
	) => any;

	/**
	 * Defines a getter on a specified object for a script.  The script will not
	 * be loaded until first use.
	 *
	 * @param aObject
	 *        The object to define the lazy getter on.
	 * @param aNames
	 *        The name of the getter to define on aObject for the script.
	 *        This can be a string if the script exports only one symbol,
	 *        or an array of strings if the script can be first accessed
	 *        from several different symbols.
	 * @param aResource
	 *        The URL used to obtain the script.
	 */
	defineLazyScriptGetter: (
		aObject: object,
		aNames: string | string[],
		aResource: string
	) => any;

	/**
	 * Overrides the scriptloader definition for tests to help with globals
	 * tracking. Should only be used for tests.
	 *
	 * @param {object} aObject
	 *        The alternative script loader object to use.
	 */
	overrideScriptLoaderForTests: (aObject: object) => any;

	/**
	 * Defines a getter property on the given object for each of the given
	 * global names as accepted by Cu.importGlobalProperties. These
	 * properties are imported into the shared JSM module global, and then
	 * copied onto the given object, no matter which global the object
	 * belongs to.
	 *
	 * @param {object} aObject
	 *        The object on which to define the properties.
	 * @param {string[]} aNames
	 *        The list of global properties to define.
	 */
	defineLazyGlobalGetters: (
		aObject: object,
		aNames: string[]
	) => any;

	/**
	 * Defines a getter on a specified object for a service.  The service will not
	 * be obtained until first use.
	 *
	 * @param aObject
	 *        The object to define the lazy getter on.
	 * @param aName
	 *        The name of the getter to define on aObject for the service.
	 * @param aContract
	 *        The contract used to obtain the service.
	 * @param aInterfaceName
	 *        The name of the interface to query the service to.
	 */
	defineLazyServiceGetter: (
		aObject: object,
		aName: string,
		aContract: string,
		aInterfaceName: string
	) => any;

	/**
	 * Defines a lazy service getter on a specified object for each
	 * property in the given object.
	 *
	 * @param aObject
	 *        The object to define the lazy getter on.
	 * @param aServices
	 *        An object with a property for each service to be
	 *        imported, where the property name is the name of the
	 *        symbol to define, and the value is a 1 or 2 element array
	 *        containing the contract ID and, optionally, the interface
	 *        name of the service, as passed to defineLazyServiceGetter.
	 */
	defineLazyServiceGetters: (
		aObject: object,
		aServices: object
	) => any;

	/**
	 * Defines a getter on a specified object for a module.  The module will not
	 * be imported until first use. The getter allows to execute setup and
	 * teardown code (e.g.  to register/unregister to services) and accepts
	 * a proxy object which acts on behalf of the module until it is imported.
	 *
	 * @param aObject
	 *        The object to define the lazy getter on.
	 * @param aName
	 *        The name of the getter to define on aObject for the module.
	 * @param aResource
	 *        The URL used to obtain the module.
	 * @param aSymbol
	 *        The name of the symbol exported by the module.
	 *        This parameter is optional and defaults to aName.
	 * @param aPreLambda
	 *        A function that is executed when the proxy is set up.
	 *        This will only ever be called once.
	 * @param aPostLambda
	 *        A function that is executed when the module has been imported to
	 *        run optional teardown procedures on the proxy object.
	 *        This will only ever be called once.
	 * @param aProxy
	 *        An object which acts on behalf of the module to be imported until
	 *        the module has been imported.
	 */
	defineLazyModuleGetter: <K extends keyof AllMozModules>(
		aObject: object,
		aName: K,
		aResource: string,
		aSymbol?: string,
		aPreLambda?: Function,
		aPostLambda?: Function,
		aProxy?: object
    ) => void;

	/**
	 * Defines a lazy module getter on a specified object for each
	 * property in the given object.
	 *
	 * @param aObject
	 *        The object to define the lazy getter on.
	 * @param aModules
	 *        An object with a property for each module property to be
	 *        imported, where the property name is the name of the
	 *        imported symbol and the value is the module URI.
	 */
	defineLazyModuleGetters<Paths extends keyof AllMozModules>(
		target: object,
		bindings: Record<Paths, string>
	): void;

	/**
	 * Defines a getter on a specified object for preference value. The
	 * preference is read the first time that the property is accessed,
	 * and is thereafter kept up-to-date using a preference observer.
	 *
	 * @param aObject
	 *        The object to define the lazy getter on.
	 * @param aName
	 *        The name of the getter property to define on aObject.
	 * @param aPreference
	 *        The name of the preference to read.
	 * @param aDefaultValue
	 *        The default value to use, if the preference is not defined.
	 * @param aOnUpdate
	 *        A function to call upon update. Receives as arguments
	 *         `(aPreference, previousValue, newValue)`
	 * @param aTransform
	 *        An optional function to transform the value.  If provided,
	 *        this function receives the new preference value as an argument
	 *        and its return value is used by the getter.
	 */
	defineLazyPreferenceGetter: (
		aObject: object,
		aName: string,
		aPreference: string,
		aDefaultValue: any,
		aOnUpdate: (
			pref: string,
			previousValue: any,
			newValue: any
		) => void,
		aTransform?: Function
	) => void;

	/**
	 * Defines a non-writable property on an object.
	 */
	defineConstant: (
		aObj: object,
		aName: string,
		aValue: any
	) => void;

	/**
	 * Defines a proxy which acts as a lazy object getter that can be passed
	 * around as a reference, and will only be evaluated when something in
	 * that object gets accessed.
	 *
	 * The evaluation can be triggered by a function call, by getting or
	 * setting a property, calling this as a constructor, or enumerating
	 * the properties of this object (e.g. during an iteration).
	 *
	 * Please note that, even after evaluated, the object given to you
	 * remains being the proxy object (which forwards everything to the
	 * real object). This is important to correctly use these objects
	 * in pairs of add+remove listeners, for example.
	 * If your use case requires access to the direct object, you can
	 * get it through the untrap callback.
	 *
	 * @param aObject
	 *        The object to define the lazy getter on.
	 *
	 *        You can pass null to aObject if you just want to get this
	 *        proxy through the return value.
	 *
	 * @param aName
	 *        The name of the getter to define on aObject.
	 *
	 * @param aInitFuncOrResource
	 *        A function or a module that defines what this object actually
	 *        should be when it gets evaluated. This will only ever be called once.
	 *
	 *        Short-hand: If you pass a string to this parameter, it will be treated
	 *        as the URI of a module to be imported, and aName will be used as
	 *        the symbol to retrieve from the module.
	 *
	 * @param aStubProperties
	 *        In this parameter, you can provide an object which contains
	 *        properties from the original object that, when accessed, will still
	 *        prevent the entire object from being evaluated.
	 *
	 *        These can be copies or simplified versions of the original properties.
	 *
	 *        One example is to provide an alternative QueryInterface implementation
	 *        to avoid the entire object from being evaluated when it's added as an
	 *        observer (as addObserver calls object.QueryInterface(Ci.nsIObserver)).
	 *
	 *        Once the object has been evaluated, the properties from the real
	 *        object will be used instead of the ones provided here.
	 *
	 * @param aUntrapCallback
	 *        A function that gets called once when the object has just been evaluated.
	 *        You can use this to do some work (e.g. setting properties) that you need
	 *        to do on this object but that can wait until it gets evaluated.
	 *
	 *        Another use case for this is to use during code development to log when
	 *        this object gets evaluated, to make sure you're not accidentally triggering
	 *        it earlier than expected.
	 */
	defineLazyProxy: (
		aObject: object,
		aName: string,
		aInitFuncOrResource: Function | string,
		aStubProperties: any,
		aUntrapCallback: Function
	) => void;
}
