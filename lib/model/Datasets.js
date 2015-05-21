/**
 * @ngdoc service
 * @name predicsis.jsSDK.Datasets
 * @requires $q
 * @requires Restangular
 * @requires jobsHelper
 * @description
 * <table>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/datasets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Datasets#methods_create Datasets.create()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge post">post</span> <kbd>/datasets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Datasets#methods_split Datasets.split()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/datasets</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Datasets#methods_all Datasets.all()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span> <kbd>/datasets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Datasets#methods_get Datasets.get()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge get">get</span><span class="badge get">get</span><span class="badge get">get</span></td>
 *     <td><kbd>{@link predicsis.jsSDK.Datasets#methods_getchildren Datasets.getChildren()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge patch">patch</span> <kbd>/datasets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Datasets#methods_update Datasets.update()}</kbd></td>
 *     <td><span class="badge async">async</span></td>
 *   </tr>
 *   <tr>
 *     <td><span class="badge delete">delete</span> <kbd>/datasets/:id</kbd></td>
 *     <td><kbd>{@link predicsis.jsSDK.Datasets#methods_delete Datasets.delete()}</kbd></td>
 *     <td></td>
 *   </tr>
 *   <tfoot>
 *   <tr><td colspan="3">Official documentation is available at https://developer.predicsis.com/doc/v1/data_management/dataset/</td></tr>
 *   </tfoot>
 * </table>
 *
 * A dataset may have various differents states:
 *
 * <h3>Learning dataset (just after upload)</h3>
 * <pre>
 * {
 *   id: 'learning_dataset',
 *   created_at: '2014-12-14T15:09:08.112Z',
 *   updated_at: '2014-12-14T15:08:57.970Z',
 *   name: 'Learning dataset',
 *   header: null,
 *   separator: null,
 *   user_id: '541b06dc617070006d060000',
 *   source_ids: ['54904b136170700007330000'],
 *   parent_dataset_id: null,
 *   sampling: 100,
 *   nb_of_lines: 50002,
 *   children_dataset_ids: [],
 *   dictionary_ids: [],
 *   generated_dictionaries_ids: [],
 *   data_file: {
 *     id: '54904b09776f720001650000',
 *     filename: 'learning-dataset.csv',
 *     type: 'S3',
 *     size: 538296,
 *     url: S3_URL + '/download/file/from/s3/learning-dataset.csv'
 *   },
 *   main_modality: null,
 *   classifier_id: null,
 *   dataset_id: null,
 *   job_ids: ['54904b146170700007360000'],
 *   preview: [
 *     '...\t...\t...',
 *     '...\t...\t...',
 *     '...\t...\t...',
 *     '...\t...\t...',
 *     '...\t...\t...'
 *   ]
 * }
 * </pre>
 *
 * <h3>Splitted learning dataset -> learned part</h3>
 * <pre>
 * {
 *   ...
 *   source_ids: [],
 *   parent_dataset_id: 'learning_dataset_with_model',
 *   sampling: 70,
 *   nb_of_lines: null,
 *   preview: null
 *   ...
 * }
 * </pre>
 *
 * <h3>Splitted learning dataset -> tested part</h3>
 * <pre>
 * {
 *   ...
 *   source_ids: [],
 *   parent_dataset_id: 'learning_dataset_with_model',
 *   sampling: -70,
 *   nb_of_lines: null,
 *   preview: null
 *   ...
 * }
 * </pre>
 *
 * <h3>After model generation</h3>
 * <pre>
 * {
 *   ...
 *   generated_dictionaries_ids: ['parent_dictionary'],
 *   children_dataset_ids: ['learned_learning_dataset', 'tested_learning_dataset'],
 *   job_ids: [
 *     '54904bfe6170700007930000',
 *     '54904bf961707000078c0000',
 *     '54904b146170700007360000',
 *     '54904ce06170700007d10000'
 *   ]
 *   ...
 * }
 * </pre>
 *
 * <h3>Scoring dataset</h3>
 * <pre>
 * {
 *   ...
 *   source_ids: ['54904da06170700007df0000'],
 *   generated_dictionaries_ids: [],
 *   children_dataset_ids: [],
 *   ...
 * }
 * </pre>
 *
 * <h3>Scoreset</h3>
 * <pre>
 * {
 *   ...
 *   classifier_id: '5436431070632d15f4260000',
 *   dataset_id: 'scoring_dataset',
 *   modalities_set_id: '53fdfa7070632d0fc5030000',
 *   ...
 * }
 * </pre>
 */
angular.module('predicsis.jsSDK')
  .service('Datasets', function($q, Restangular, jobsHelper) {
    'use strict';
    var self = this;

    function dataset(id) { return Restangular.one('datasets', id); }
    function datasets() { return Restangular.all('datasets'); }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc function
     * @name create
     * @methodOf predicsis.jsSDK.Datasets
     * @description Create a dataset from a source
     *  <h4>Basic dataset creation</h4>
     *  <pre>
     *  {
     *    name:       'My awesome dataset',
     *    source_ids: ['original_source_id'],
     *    header:     true,
     *    separator:  '\t',
     *    data_file:  { filename: 'source.csv' }
     *  }
     *  </pre>
     *
     *  Only <code>name</code> and <code>source_ids</code> are required.
     *
     *  <h4>Scoring a file regarding to an existing model</h4>
     *  <pre>
     *  {
     *    name:              'My awesome dataset',
     *    classifier_id:     $classifier_id$,
     *    dataset_id:        $dataset_id$,
     *    modalities_set_id: $modalities_set_id$,
     *    main_modality:     $main_modality$,
     *    separator:         $separator$,
     *    header:            $header$,
     *    data_file:         { filename: $name$ }
     *  }
     *  </pre>
     *
     * @param {Object} params See above description
     * @return {Promise} New dataset or new scoreset
     */
    this.create = function(params) {
      return jobsHelper.wrapAsyncPromise(datasets().post({dataset: params}))
        .then(function(result) {
          return dataset(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name split
     * @methodOf predicsis.jsSDK.Datasets
     * @description Split a dataset into subsets according to <code>smapling</code> ratio.
     *  <b>Note:</b>
     *  <ul>
     *    <li>Learning subset will be named <code>learned_#dataset_name#</code>
     *    <li>Testing subset will be named <code>tested_#dataset_name#</code>
     *    <li>Idem for learning/testing filenames</li>
     *  </ul>
     *
     * @param {String} id            Dataset id you want to split (called <em>original dataset</em>)
     * @param {String} name          Name of the original dataset (used to name its subsets)
     * @param {String} filename      Name of the original datafile (used to name its subsets's datafile)
     * @param {Number} [sampling=70] Examples: If you set <code>sampling</code> to 70, you are going to have:
     * <ul>
     *   <li><code>70%</code> of your original dataset for <b>learning</b></li>
     *   <li><code>30%</code> of your original dataset for <b>testing</b></li>
     * </ul><br/>
     * @return {Promise} Subsets
     */
    this.split = function(id, name, filename, sampling) {
      sampling = sampling || 70;
      var learn = {
        parent_dataset_id: id,
        name: 'learned_' +  name,
        data_file: {filename: 'learned_' + filename},
        sampling: sampling
      };

      var test = {
        parent_dataset_id: id,
        name: 'tested_' + name,
        data_file: {filename: 'tested_' + filename},
        sampling: -sampling
      };

      return $q.all([this.create(learn), this.create(test)]);
    };

    /**
     * @ngdoc function
     * @name all
     * @methodOf predicsis.jsSDK.Datasets
     * @description Get all (or a list of) datasets
     *
     * @param {Array} [ids] List of datasets' id you want to fetch
     * @return {Promise} List of datasets
     */
    this.all = function(ids) {
      if(ids === undefined) {
        return datasets().getList();
      } else {
        ids = ids || [];

        return $q.all(ids.map(function(id) {
          return dataset(id).get();
        }));
      }
    };

    /**
     * @ngdoc function
     * @name get
     * @methodOf predicsis.jsSDK.Datasets
     * @description Get a single dataset by its id
     *
     * @param {String} id Dataset identifier
     * @return {Promise} Requested dataset
     */
    this.get = function(id) {
      return dataset(id).get();
    };

    /**
     * @ngdoc function
     * @name getChildren
     * @methodOf predicsis.jsSDK.Datasets
     * @description Get learning/testing subsets of an original dataset
     * <div><span class="badge get">get</span><code>/datasets</code></div>
     * <div><span class="badge get">get</span><code>/datasets/:learned_dataset_id</code></div>
     * <div><span class="badge get">get</span><code>/datasets/:tested_dataset_id</code></div>
     *
     * @param {String} id Identifier of an original dataset
     * @return {Promise}
     * <ul>
     *   <li><code>children.train</code>: learning dataset</li>
     *   <li><code>children.test</code>: testing dataset</li>
     * </ul>
     */
    this.getChildren = function(id) {
      return self.get(id)
        .then(function(originalDataset) {
          return self.all(originalDataset.children_dataset_ids);
        })
        .then(function(subsets) {
          return subsets.reduce(function(memo, child) {
            if (child.sampling > 0) {
              memo.train = child;
            } else {
              memo.test = child;
            }

            return memo;
          }, {});
        });
    };

    /**
     * @ngdoc function
     * @name update
     * @methodOf predicsis.jsSDK.Datasets
     * @description Update specified dataset
     *  You can update the following parameters:
     *  <ul>
     *    <li><code>{String} name</code></li>
     *    <li><code>{Boolean} header</code></li>
     *    <li><code>{String} separator</code></li>
     *  </ul>
     *
     *  If a <code>separator</code> is updated, this function also escape this string because there is a paradox:
     *  <ul>
     *    <li>
     *      The API requires a separator like "\t".<br/>
     *      To do so, the separator sent in the request must be "\\t".
     *    </li>
     *    <li>
     *      The view requires a tabulation to be able to build the preview.<br/>
     *      To do so, the separator given to the preview method must be "\t".
     *    </li>
     *  </ul>
     *
     * @param {String} id Id of the dictionary you want to update
     * @param {Object} changes see above description to know parameters you are able to update
     * @return {Promise} Updated dataset
     */
    this.update = function(id, changes) {
      if (changes.separator && changes.separator === '\t') {
        changes.separator = '\\t';
      }

      return jobsHelper.wrapAsyncPromise(dataset(id).patch({dataset: changes}))
        .then(function(result) {
          return dataset(result.id).get();
        });
    };

    /**
     * @ngdoc function
     * @name delete
     * @methodOf predicsis.jsSDK.Datasets
     * @description Permanently destroy a specified dataset
     * @param {String} id Id of the dataset you want to remove
     * @return {Promise} Removed dataset
     */
    this.delete = function(id) {
      return dataset(id).remove();
    };

  });
